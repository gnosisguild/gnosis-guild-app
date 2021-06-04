import { useCallback } from "react";
import { request, gql } from "graphql-request";
import { getNetworkByChainId } from "../lib/networks";
import { storeGuildLocal, deleteGuildLocal } from "../lib/localStorage";
import { Contract, ethers } from "ethers";
import { GuildMetadata, useGuildContext } from "../context/GuildContext";

export type GraphGuild = {
  active: boolean;
  currentBalance: number;
  currentPrice: number;
  id: string;
  metadataURI: string;
  name: string;
  owner: string;
  subsPeriod: number;
  subscriptions: Array<any>;
  symbol: string;
  tokenAddress: string;
  totalSubscriptions: number;
};

export const useGuild = () => {
  const { setGuildMetadata } = useGuildContext();
  const fetchGuildByAddress = useCallback(
    async (address: string, chainId: number): Promise<Array<GraphGuild>> => {
      const fetchGuildQuery = gql`
        query getGuildByOwner($ownerAddress: String) {
          guilds(where: { owner: $ownerAddress }) {
            id
            owner
            name
            symbol
            metadataURI
            active
            tokenAddress
            currentPrice
            subsPeriod
            currentBalance
            totalSubscriptions
            subscriptions
          }
        }
      `;
      const network = getNetworkByChainId(chainId);
      const resp = await request(network.subgraphUrl, fetchGuildQuery, {
        ownerAddress: address
      }).catch(e => {
        console.error(e);
        console.error("Failed call");
      });
      if (resp && resp.guilds && resp.guilds.length > 0) {
        return resp.guilds;
      }
      return [];
    },
    []
  );

  const fetchGuild = useCallback(
    async (guildId: string, chainId: number): Promise<GraphGuild | null> => {
      const fetchGuildQuery = gql`
        query getGuild($id: String) {
          guild(id: $id) {
            id
            owner
            name
            symbol
            metadataURI
            active
            tokenAddress
            currentPrice
            subsPeriod
            currentBalance
            totalSubscriptions
            subscriptions
          }
        }
      `;
      const network = getNetworkByChainId(chainId);
      const resp = await request(network.subgraphUrl, fetchGuildQuery, {
        id: guildId.toLowerCase()
      }).catch(e => {
        console.error(e);
        console.error("Failed call");
      });
      console.log("GUIDL", resp);
      if (resp && resp.guild) {
        return resp.guild;
      }
      return null;
    },
    []
  );

  const createGuild = async (
    chainId: number,
    ethersProvider: ethers.providers.Web3Provider,
    guildInfo: GuildMetadata,
    creatorAddress: string
  ): Promise<void> => {
    const network = getNetworkByChainId(chainId);

    // Fetch count to get ID
    const factoryAbi = [
      "function createGuild(bytes calldata _initData) public ",
      "function totalGuilds() public view returns (uint256)"
    ];
    const factoryContract = new Contract(
      network.guildFactory,
      factoryAbi,
      ethersProvider.getSigner()
    );

    const count = await factoryContract
      .totalGuilds()
      .catch((err: Error) =>
        console.error(`Failed to fetch total guilds ${err}`)
      );

    const guildAppAbi = [
      "function initialize(address _creator, address _tokenAddress, uint256 _subPrice, uint256 _subscriptionPeriod, tuple(string, string, string, string) memory _metadata) public"
    ];
    let tokenAddress = "0x0000000000000000000000000000000000000000";
    if (guildInfo.currency === "Dai") {
      tokenAddress = network.daiToken;
    }
    const subscriptionTime = 30 * 24 * 60 * 60; // 30 days
    const functionArgs = [
      creatorAddress,
      tokenAddress,
      ethers.utils.parseEther(guildInfo.amount),
      subscriptionTime,
      [guildInfo.name, `GUILD${count}`, "", ""]
    ];
    const iface = new ethers.utils.Interface(guildAppAbi);
    const calldata = iface.encodeFunctionData("initialize", functionArgs);

    factoryContract
      .createGuild(calldata)
      .catch((err: Error) => console.error(`Failed to create guild: ${err}`));
    storeGuildLocal(guildInfo);
  };

  const deactivateGuild = async (
    chainId: number,
    ethersProvider: ethers.providers.Web3Provider,
    ownerAddress: string
  ): Promise<void> => {
    const network = getNetworkByChainId(chainId);
    const abi = [
      "function guildsOf(address _owner) public view returns (address[] memory)"
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
    console.log("Guilds");
    console.log(guilds);
    // Call pause
    const guildAddress = guilds[0];

    if (!guildAddress) {
      deleteGuildLocal();
      return;
    }
    const abiApp = ["function pauseGuild(bool pause) external"];
    const guildContract = new Contract(
      guildAddress,
      abiApp,
      ethersProvider.getSigner()
    );
    deleteGuildLocal();
    setGuildMetadata({
      name: "",
      description: "",
      contentFormat: "",
      externalLink: "",
      image: "",
      currency: "ETH",
      amount: "0"
    });
    // guildContract
    //   .pauseGuild(true)
    //   .catch((err: Error) => console.error(`Failed to pause ${err}`));
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
    const guildAddress = await _fetchGuild(
      chainId,
      ethersProvider,
      ownerAddress
    );
    if (!guildAddress) {
      return 0;
    }
    const abiApp = [
      "function guildBalance(address _tokenAddress) public view returns (uint256)"
    ];
    const guildContract = new Contract(
      guildAddress,
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
      "function guildsOf(address _owner) public view returns (address[] memory)"
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
    console.log("Guilds");
    console.log(guilds);
    // Call pause
    const guildAddress = guilds[0];
    return guildAddress;
  };

  const subscribe = async (
    chainId: number,
    ethersProvider: ethers.providers.Web3Provider,
    guildAddress: string,
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
      value,
      metadata
    );

    const guildAppAbi = [
      "function subscribe(string memory _tokenURI, uint256 _value, bytes calldata _data) public payable"
    ];

    const guildContract = new Contract(
      guildAddress,
      guildAppAbi,
      ethersProvider.getSigner()
    );

    // TODO: save metadata on the GuildApp Space (e.g. 3box or 3ID?)
    console.log("Metadata to be saved", metadata);
    // TOOD:  generate tokenURI
    const tokenURI = "";
    const bnValue = ethers.utils.parseEther(value);

    const args = [tokenURI, bnValue.toString(), "0x"];
    console.log("Subscribe args", ...args);
    await guildContract.subscribe(...args);
  };

  return {
    fetchGuildByAddress,
    fetchGuild,
    createGuild,
    deactivateGuild,
    fetchGuildTokens,
    subscribe
  };
};
