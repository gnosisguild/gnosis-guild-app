import axios from "axios";
import { Contract, ethers } from "ethers";

import { API, IPFS_GATEWAY } from "../constants";
import GuildFactoryABI from "../contracts/GuildFactory.json";
import GuildAppABI from "../contracts/GuildApp.json";
import { getNetworkByChainId } from "../lib/networks";

import { GuildMetadata, useGuildContext } from "../context/GuildContext";

export const useGuild = () => {
  const { refreshGuild, guildMetadata } = useGuildContext();

  const fetchMetadata = async (
    metadataURI: string,
    guildAddress: string
  ): Promise<GuildMetadata> => {
    const resp = await axios.get(metadataURI);

    let imageResp = await fetch(`${IPFS_GATEWAY}/${resp.data.imageCid}`).catch(
      (err: Error) => console.error("Failed to fetch metadata image")
    );
    let blob = new Blob();
    if (imageResp) {
      blob = await imageResp.blob();
    }

    const image = new File([blob], "profile.jpg");
    return {
      ...resp.data,
      guildAddress: guildAddress,
      imageCid: resp.data.imageCid,
      image,
    };
  };

  const createGuild = async (
    chainId: number,
    ethersProvider: ethers.providers.Web3Provider,
    guildInfo: GuildMetadata,
    creatorAddress: string,
    setPrevModal?: (arg0: boolean) => void
  ): Promise<ethers.providers.TransactionResponse> => {
    try {
      const network = getNetworkByChainId(chainId);

      const factoryContract = new Contract(
        network.guildFactory,
        GuildFactoryABI,
        ethersProvider.getSigner()
      );
      const count = await factoryContract.totalGuilds();

      let tokenAddress = ethers.constants.AddressZero;
      if (guildInfo.currency === "DAI") {
        tokenAddress = network.daiToken;
      }
      const subscriptionTime = 30 * 24 * 60 * 60; // 30 days
      const metadataCid = await saveMetadata(guildInfo);
      const functionArgs = [
        creatorAddress,
        tokenAddress,
        ethers.utils.parseEther(guildInfo.amount),
        subscriptionTime,
        [guildInfo.name, `GUILD${count}`, "https://ipfs.io/ipfs/", metadataCid],
      ];

      const iface = new ethers.utils.Interface(GuildAppABI);
      const calldata = iface.encodeFunctionData("initialize", functionArgs);

      if (setPrevModal) {
        setPrevModal(false);
      }
      // TODO: Add Guild address here
      const txResponse = await factoryContract.functions["createGuild(bytes)"](
        calldata
      );
      return txResponse;
    } catch (error) {
      console.error(`Failed to create guild: ${error}`);
      throw new Error(error);
    }
  };

  const deactivateGuild = async (
    chainId: number,
    ethersProvider: ethers.providers.Web3Provider,
    ownerAddress: string,
    guildAddress: string
  ): Promise<void> => {
    const network = getNetworkByChainId(chainId);
    if (!guildAddress) {
      return;
    }
    const abiApp = ["function pauseGuild(bool pause) external"];
    const guildContract = new Contract(
      guildAddress,
      abiApp,
      ethersProvider.getSigner()
    );
    await guildContract
      .pauseGuild(true)
      .catch((err: Error) => console.error(`Failed to pause ${err}`));

    refreshGuild();
  };

  const updateMetadataCid = async (
    guildInfo: GuildMetadata,
    ethersProvider: ethers.providers.Web3Provider,
    setPrevModal?: (arg0: boolean) => void
  ): Promise<ethers.providers.TransactionResponse> => {
    const abiApp = [
      "function setMetadata(string memory _metadataCID) external ",
    ];
    const guildContract = new Contract(
      guildInfo.guildAddress,
      abiApp,
      ethersProvider.getSigner()
    );

    const metadataCid = await saveMetadata(guildInfo);

    if (setPrevModal) {
      setPrevModal(false);
    }
    const transaction = await guildContract
      .setMetadata(metadataCid)
      .catch((err: Error) => console.error("Failed to set metadata cid"));
    return transaction;
  };

  const saveMetadata = async (guildInfo: GuildMetadata): Promise<string> => {
    const form = new FormData();
    form.append("name", guildInfo.name);
    form.append("description", guildInfo.description);
    form.append("contentFormat", guildInfo.contentFormat);
    form.append("externalLink", guildInfo.externalLink);
    form.append("image", guildInfo.image);
    form.append("currency", guildInfo.currency);
    form.append("amount", guildInfo.amount);
    const resp = await axios.post(`${API}/api/v1/guild`, form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return resp.data.metadataCid;
  };

  const fetchSubscribers = () => {
    // Missing smart contract function
  };

  const fetchGuildTokens = async (
    chainId: number,
    ethersProvider: ethers.providers.Web3Provider,
    ownerAddress: string,
    token: string
  ): Promise<number> => {
    if (!guildMetadata.guildAddress) {
      return 0;
    }
    const abiApp = [
      "function guildBalance(address _tokenAddress) public view returns (uint256)",
    ];
    const guildContract = new Contract(
      guildMetadata.guildAddress,
      abiApp,
      ethersProvider.getSigner()
    );

    const network = getNetworkByChainId(chainId);
    let tokenAddress = network.daiToken;
    if (token === "ETH") {
      tokenAddress = "0x0000000000000000000000000000000000000000";
    }

    return await guildContract
      .guildBalance(tokenAddress)
      .catch((err: Error) => console.error(`${err}`));
  };

  const _fetchGuild = async (
    chainId: number,
    ethersProvider: ethers.providers.Web3Provider,
    ownerAddress: string
  ): Promise<string> => {
    const network = getNetworkByChainId(chainId);
    const abi = [
      "function guildsOf(address _owner) public view returns (address[] memory)",
    ];
    // get guilds
    const guildAppContract = new Contract(
      network.guildFactory,
      abi,
      ethersProvider.getSigner()
    );
    const guilds = await guildAppContract
      .guildsOf(ownerAddress)
      .catch((err: Error) => console.error(`Failed to create guild: ${err}`));

    // Select the first
    // Call pause
    const guildAddress = guilds[0];
    return guildAddress;
  };

  const subscribe = async (
    chainId: number,
    ethersProvider: ethers.providers.Web3Provider,
    guildAddress: string,
    guildToken: string,
    value: string,
    metadata: {
      name: string;
      email: string;
    }
  ): Promise<void> => {
    console.log(
      "Subscribe",
      chainId,
      await ethersProvider.getSigner().getAddress(),
      guildAddress,
      guildToken,
      value,
      metadata
    );

    const guildContract = new Contract(
      guildAddress,
      GuildAppABI,
      ethersProvider.getSigner()
    );

    // TODO: save metadata on the GuildApp Space (e.g. 3box or 3ID?)
    console.log("Metadata to be saved", metadata);
    // TODO:  generate tokenURI
    const tokenURI = "";
    const bnValue = ethers.utils.parseEther(value);

    if (guildToken !== ethers.constants.AddressZero) {
      console.log("Should send Token...");
      // TODO: This should be done using a batch Tx & replaced using the recurring allowance module
      const erc20Abi = [
        "function approve(address spender, uint256 amount) public returns (bool)",
      ];
      const tokenContract = new Contract(
        guildToken,
        erc20Abi,
        ethersProvider.getSigner()
      );
      await tokenContract.approve(guildAddress, bnValue.toString());
    }

    const args = [tokenURI, bnValue.toString(), "0x"];
    console.log("Subscribe args", ...args);
    await guildContract.subscribe(...args, {
      value:
        guildToken === ethers.constants.AddressZero ? bnValue.toString() : "0",
    });
  };

  return {
    createGuild,
    deactivateGuild,
    fetchGuildTokens,
    subscribe,
    fetchMetadata,
    updateMetadataCid,
  };
};
