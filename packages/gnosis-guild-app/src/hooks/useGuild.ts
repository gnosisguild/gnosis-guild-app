import { useCallback } from "react";
import axios from "axios";
import { Contract, ethers } from "ethers";
import SafeAppsSDK, {
  SendTransactionsResponse,
  GatewayTransactionDetails,
} from "@gnosis.pm/safe-apps-sdk";

import { API, IPFS_GATEWAY } from "../constants";
import GuildFactoryABI from "../contracts/GuildFactory.json";
import GuildAppABI from "../contracts/GuildApp.json";
import { getNetworkByChainId } from "../lib/networks";
import { SUBSCRIPTION_PERIOD_DEFAULT } from "../constants";

import { GuildMetadata, useGuildContext } from "../context/GuildContext";
import { useWeb3Context } from "../context/Web3Context";
import ERC20Abi from "../contracts/ERC20.json";

function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type SafetGuild = {
  createGuild: (
    arg0: number,
    arg1: ethers.providers.Web3Provider,
    arg2: GuildMetadata,
    arg3: string,
    arg4: SafeAppsSDK,
    arg5?: (arg0: boolean, arg1?: string, arg2?: string) => void
  ) => Promise<GatewayTransactionDetails>;
  deactivateGuild: (
    arg0: ethers.providers.Web3Provider,
    arg1: string,
    arg2: SafeAppsSDK,
    arg3?: (arg0: boolean, arg1?: string, arg2?: string) => void
  ) => Promise<GatewayTransactionDetails | undefined>;
  fetchGuildTokens: (
    arg0: number,
    arg1: ethers.providers.Web3Provider,
    arg3: string,
    arg4: string
  ) => Promise<number>;
  subscribe: (
    arg0: number,
    arg1: ethers.providers.Web3Provider,
    arg2: string,
    arg3: string,
    arg4: string
  ) => Promise<ethers.providers.TransactionResponse | null>;
  unsubscribe: (
    keyId: string,
    guildAddress: string,
    ethersProvider: ethers.providers.Web3Provider
  ) => Promise<ethers.providers.TransactionResponse | null>;
  fetchMetadata: (arg0: string, arg1: string) => Promise<GuildMetadata>;
  updateMetadataCid: (
    arg0: GuildMetadata,
    arg1: ethers.providers.Web3Provider,
    arg2: SafeAppsSDK,
    arg3?: (arg0: boolean, arg1?: string, arg2?: string) => void
  ) => Promise<GatewayTransactionDetails | Error>;
};

const pollSafeTx = async (
  safeTxs: SendTransactionsResponse,
  sdk: SafeAppsSDK
): Promise<GatewayTransactionDetails> => {
  let retries = 0;
  let safeTx;
  let waitForConfrimation = true;
  while (retries <= 15 && waitForConfrimation) {
    const results = await Promise.all([
      sdk.txs.getBySafeTxHash(safeTxs.safeTxHash),
    ]).catch((err) => {
      console.error(err);
    });
    await timeout(1000);
    if (results && results.slice(0)) {
      [safeTx] = results as any;
      console.log("HWERE");
      console.log(safeTx);
      waitForConfrimation =
        safeTx.detailedExecutionInfo.confirmationsRequired === 1;
      // Max wait of 10 minutes
      if (waitForConfrimation === true && retries <= 600) {
        waitForConfrimation = safeTx.txStatus !== "SUCCESS";
      }
    }
    retries++;
    console.log(safeTx);
  }
  return safeTx;
};

export const useGuild = (): SafetGuild => {
  const { guildMetadata } = useGuildContext();
  const {
    cpk,
    fundProxy,
    getProxyBalance,
    setupCPKModules,
    encodeAllowanceModuleCall,
    signTransfer,
    submitCPKTx,
  } = useWeb3Context();

  const fetchMetadata = useCallback(
    async (
      metadataURI: string,
      guildAddress: string
    ): Promise<GuildMetadata> => {
      const resp = await axios.get(metadataURI);

      const imageResp = await fetch(
        `${IPFS_GATEWAY}/${resp.data.imageCid}`
      ).catch((err: Error) =>
        console.error(`Failed to fetch metadata image ${err}`)
      );
      let blob = new Blob();
      if (imageResp) {
        blob = await imageResp.blob();
      }

      const image = new File([blob], "profile.jpg");
      return {
        ...resp.data,
        guildAddress,
        imageCid: resp.data.imageCid,
        image,
      };
    },
    []
  );

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
      const subscriptionTime = SUBSCRIPTION_PERIOD_DEFAULT * 60; // Get time in seconds
      const metadataCid = await saveMetadata(guildInfo);
      const functionArgs = [
        creatorAddress,
        tokenAddress,
        ethers.utils.parseEther(guildInfo.amount),
        subscriptionTime,
        [guildInfo.name, `GUILD${count}`, "https://ipfs.io/ipfs/", metadataCid],
        network.gnosisConfig.allowanceModule,
      ];

      const iface = new ethers.utils.Interface(GuildAppABI);
      const calldata = iface.encodeFunctionData("initialize", functionArgs);

      if (setPrevModal) {
        setPrevModal(false);
      }
      const unsignedTransaction = await factoryContract.populateTransaction[
        "createGuild(bytes)"
      ](calldata);

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
      tokenAddress = ethers.constants.AddressZero;
    }

    return await guildContract
      .guildBalance(tokenAddress)
      .catch((err: Error) => console.error(`${err}`));
  };

  const subscribe = async (
    chainId: number,
    ethersProvider: ethers.providers.Web3Provider,
    guildAddress: string,
    guildToken: string,
    value: string
  ): Promise<ethers.providers.TransactionResponse | null> => {
    const signer = ethersProvider.getSigner();

    const guildContract = new Contract(guildAddress, GuildAppABI, signer);

    // TODO:  generate tokenURI
    const tokenURI = "";
    const bnValue = ethers.utils.parseEther(value);

    if (cpk) {
      // Contribute using CPK proxy
      const balance = await getProxyBalance(guildToken);
      if (balance.lt(bnValue)) {
        // TODO: user should opt in to fund the proxy and specify the deposit value
        await fundProxy(guildToken, bnValue.toString());
      }
      const cpkModuleTxs = await setupCPKModules(
        guildToken,
        bnValue.toString(),
        guildAddress // delegate Contract
      );
      const transferSignature = await signTransfer(
        guildAddress,
        guildToken,
        bnValue.toString()
      );
      const args = [tokenURI, bnValue.toString(), transferSignature];

      const tx = await submitCPKTx([
        ...cpkModuleTxs,
        {
          // operation: 0, // CPK.Call by default
          to: guildAddress,
          // value: "0",
          data: guildContract.interface.encodeFunctionData("subscribe", args),
        },
      ]);
      return tx;
    }
    // Else Contribute using injected EOA wallet
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
  };

  const unsubscribe = async (
    keyId: string,
    guildAddress: string,
    ethersProvider: ethers.providers.Web3Provider
  ): Promise<ethers.providers.TransactionResponse | null> => {
    const guildContract = new Contract(
      guildAddress,
      GuildAppABI,
      ethersProvider.getSigner()
    );

    if (cpk) {
      const tx = await submitCPKTx([
        ...encodeAllowanceModuleCall("removeDelegate", [guildAddress, "1"]),
        {
          // operation: 0, // CPK.Call by default
          to: guildAddress,
          value: "0",
          data: guildContract.interface.encodeFunctionData("unsubscribe", [
            keyId,
          ]),
        },
      ]);
      return tx;
    }

    const tx = await guildContract.unsubscribe(keyId);
    return tx;
  };

  return {
    createGuild,
    deactivateGuild,
    fetchGuildTokens,
    subscribe,
    unsubscribe,
    fetchMetadata,
    updateMetadataCid,
  };
};
