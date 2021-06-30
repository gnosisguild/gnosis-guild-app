import axios from "axios";
import { Contract, ethers } from "ethers";
import {
  SendTransactionsResponse,
  GatewayTransactionDetails,
} from "@gnosis.pm/safe-apps-sdk";

import SafeAppsSDK from "@gnosis.pm/safe-apps-sdk";

import { API, IPFS_GATEWAY } from "../constants";
import GuildFactoryABI from "../contracts/GuildFactory.json";
import GuildAppABI from "../contracts/GuildApp.json";
import { getNetworkByChainId } from "../lib/networks";

import { GuildMetadata, useGuildContext } from "../context/GuildContext";
import { useWeb3Context } from "../context/Web3Context";
import ERC20Abi from "../contracts/ERC20.json";

function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const pollSafeTx = async (
  safeTxs: SendTransactionsResponse,
  sdk: SafeAppsSDK
): Promise<GatewayTransactionDetails> => {
  let retries = 0;
  let safeTx = undefined;
  let waitForConfrimation = true;
  while (retries <= 15 && waitForConfrimation) {
    const results = await Promise.all([
      sdk.txs.getBySafeTxHash(safeTxs.safeTxHash),
      timeout(1000),
    ]).catch((err) => console.error(err));
    if (results && results.slice(0)) {
      [safeTx] = results as any;
      console.log("HWERE");
      console.log(safeTx);
      waitForConfrimation =
        safeTx.detailedExecutionInfo.confirmationsRequired === 1 ? true : false;
      if (waitForConfrimation === true && retries <= 300) {
        waitForConfrimation = safeTx.txStatus === "SUCCESS" ? false : true;
      }
    }
    retries++;
    console.log(safeTx);
  }
  return safeTx;
};

export const useGuild = () => {
  const { refreshGuild, guildMetadata } = useGuildContext();
  const {
    cpk,
    fundProxy,
    getProxyBalance,
    setupCPKModules,
    signTransfer,
    submitCPKTx
  } = useWeb3Context();

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
    sdk: SafeAppsSDK,
    setPrevModal?: (arg0: boolean, arg1?: string, arg2?: string) => void
  ): Promise<GatewayTransactionDetails> => {
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
      const unsignedTransaction = await factoryContract.populateTransaction[
        "createGuild(bytes)"
      ](calldata);

      console.log(unsignedTransaction);
      const txs = [
        {
          to: network.guildFactory,
          value: "0",
          data: unsignedTransaction.data as string,
        },
      ];
      if (setPrevModal) {
        setPrevModal(
          true,
          "Transaction is proccessing",
          "Processing should finished in a few minutes!"
        );
      }

      const safeTxs = await sdk.txs.send({ txs });
      const safeTx = await pollSafeTx(safeTxs, sdk);

      return safeTx;
    } catch (error) {
      console.error(`Failed to create guild: ${error}`);
      throw new Error(error);
    }
  };

  const deactivateGuild = async (
    ethersProvider: ethers.providers.Web3Provider,
    ownerAddress: string,
    guildAddress: string,
    sdk: SafeAppsSDK,
    setPrevModal?: (arg0: boolean, arg1?: string, arg2?: string) => void
  ): Promise<GatewayTransactionDetails | undefined> => {
    if (!guildAddress) {
      return;
    }
    const abiApp = ["function pauseGuild(bool pause) external"];
    const guildContract = new Contract(
      guildAddress,
      abiApp,
      ethersProvider.getSigner()
    );
    const unsignedTransaction =
      await guildContract.populateTransaction.pauseGuild(true);

    const txs = [
      {
        to: guildAddress,
        value: "0",
        data: unsignedTransaction.data as string,
      },
    ];

    const safeTxs = await sdk.txs.send({ txs });
    if (setPrevModal) {
      setPrevModal(
        true,
        "Transaction is proccessing",
        "Processing should finished in a few minutes!"
      );
    }
    const safeTx = await pollSafeTx(safeTxs, sdk);
    return safeTx;
  };

  const updateMetadataCid = async (
    guildInfo: GuildMetadata,
    ethersProvider: ethers.providers.Web3Provider,
    sdk: SafeAppsSDK,
    setPrevModal?: (arg0: boolean, arg1?: string, arg2?: string) => void
  ): Promise<GatewayTransactionDetails> => {
    const metadataCid = await saveMetadata(guildInfo);

    const guildContract = new Contract(
      guildInfo.guildAddress,
      GuildAppABI,
      ethersProvider.getSigner()
    );

    if (setPrevModal) {
      setPrevModal(false);
    }
    const unsignedTransaction =
      await guildContract.populateTransaction.setMetadata(metadataCid);

    const txs = [
      {
        to: guildInfo.guildAddress,
        value: "0",
        data: unsignedTransaction.data as string,
      },
    ];

    const safeTxs = await sdk.txs.send({ txs });
    if (setPrevModal) {
      setPrevModal(
        true,
        "Transaction is proccessing",
        "Processing should finished in a few minutes!"
      );
    }
    const safeTx = await pollSafeTx(safeTxs, sdk);
    return safeTx;
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
  ): Promise<ethers.providers.TransactionResponse | null> => {
    const signer = ethersProvider.getSigner();
    console.log(
      "Subscribe",
      chainId,
      await signer.getAddress(),
      guildAddress,
      guildToken,
      value,
    );

    const guildContract = new Contract(
      guildAddress,
      GuildAppABI,
      signer
    );

    // TODO:  generate tokenURI
    const tokenURI = "";
    const bnValue = ethers.utils.parseEther(value);

    if (cpk) {
      // Contribute using CPK proxy
      console.log('Using CPK');
      const balance = await getProxyBalance(guildToken);
      if (balance.lt(bnValue)) {
        console.log("STEP 0: Fund Proxy");
        // TODO: user should opt in to fund the proxy and specify the deposit value
        await fundProxy(guildToken, bnValue.toString());
      }
      // TODO: Call only if subscribes for the 1st time
      // const cpkModuleTxs = !subscription ? await setupCPKModules(guildToken, bnValue.toString()) : [];
      const cpkModuleTxs = await setupCPKModules(guildToken, bnValue.toString());
      // TODO: Should store the signature for the contribution of the current period
      // TODO: delegate signature should be from Guild contract
      const transferSignature = await signTransfer(guildAddress, guildToken, bnValue.toString());
      const args = [tokenURI, bnValue.toString(), transferSignature];
      
      const tx = await submitCPKTx([
        ...cpkModuleTxs,
        {
          operation: 0, // TODO: CPK.Call
          to: guildAddress,
          value: guildToken === ethers.constants.AddressZero ? bnValue.toString() : "0",
          data: guildContract.interface.encodeFunctionData("subscribe", args),
        }
      ]);
      return tx;
    } else {
      // Contribute using injected EOA wallet
      console.log('Using EOA');
      if (guildToken !== ethers.constants.AddressZero) {
        const tokenContract = new Contract(
          guildToken,
          ERC20Abi,
          ethersProvider.getSigner()
        );
        const tx = await tokenContract.approve(guildAddress, bnValue.toString());
        await tx.wait(1);
      }
      const args = [tokenURI, bnValue.toString(), "0x"];
      const tx = await guildContract.subscribe(...args, {
        value:
          guildToken === ethers.constants.AddressZero ? bnValue.toString() : "0",
      });
      return tx;
    }
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
