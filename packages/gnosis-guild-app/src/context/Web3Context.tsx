import CPK, { EthersAdapter, Transaction } from "contract-proxy-kit";
import React, { useContext, useCallback, useEffect, useState } from "react";
import { SafeAppWeb3Modal as Web3Modal } from "@gnosis.pm/safe-apps-web3modal";

import { EthereumAuthProvider, ThreeIdConnect } from "@3id/connect";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { BigNumber, ethers } from "ethers";
import type { Network } from "@ethersproject/providers";
import Ceramic from "@ceramicnetwork/http-client";
import { IDX } from "@ceramicstudio/idx";
import type { IDX as IDXApi } from "@ceramicstudio/idx";
import { DID } from "dids";
import { Resolver } from "did-resolver";
import ThreeIdResolver from "@ceramicnetwork/3id-did-resolver";
import KeyDidResolver from "key-did-resolver";

import { SUBSCRIPTION_PERIOD_DEFAULT } from "../constants";
import { getNetworkByChainId } from "../lib/networks";
import AllowanceModuleAbi from "../contracts/gnosis/AllowanceModule.json";
import ERC20Abi from "../contracts/ERC20.json";

export type Web3ContextValue = {
  connectToWeb3: () => void;
  authenticateCeramic: () => Promise<string>;
  disconnect: () => void;
  getConnectText: () => string;
  getBalanceOf: (account: string, tokenAddress: string) => Promise<BigNumber>;
  getProxyBalance: (tokenAddress: string) => Promise<BigNumber>;
  fundProxy: (tokenAddress: string, value: string) => Promise<void>;
  setupCPKModules: (
    tokenAddress: string,
    deposit: string,
    delegateContract: string
  ) => Promise<Array<Transaction>>;
  encodeAllowanceModuleCall(
    functionName: string,
    args: Array<string>
  ): Array<Transaction>;
  signTransfer: (
    guildAddress: string,
    tokenAddress: string,
    contributionValue: string
  ) => Promise<string>;
  submitCPKTx: (
    txs: Array<Transaction>
  ) => Promise<ethers.providers.TransactionResponse | null>;
  ethersProvider?: ethers.providers.Web3Provider;
  account: string;
  providerChainId: number;
  connected: boolean;
  idx?: IDXApi;
  did?: DID;
  network?: Network;
  cpk: CPK | null;
};

type Web3State = {
  account: string;
  providerChainId: number;
  ethersProvider?: ethers.providers.Web3Provider;
  cpk?: CPK;
};

const initialWeb3Context = {
  connectToWeb3: () => {},
  authenticateCeramic: async () => "",
  disconnect: () => {},
  getConnectText: () => "",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getBalanceOf: async (account: string, tokenAddress: string) =>
    BigNumber.from("0"),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getProxyBalance: async (tokenAddress: string) => BigNumber.from("0"),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fundProxy: async (tokenAddress: string, value: string) => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setupCPKModules: async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tokenAddress: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    deposit: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    delegateContract: string
  ) => [],
  encodeAllowanceModuleCall: (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    functionName: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    args: Array<string>
  ) => [],
  signTransfer: async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    guildAddress: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tokenAddress: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    contributionValue: string
  ) => "",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  submitCPKTx: async (txs: Array<Transaction>) => null,
  account: "",
  providerChainId: 0,
  connected: false,
  cpk: null,
};

export const Web3Context =
  React.createContext<Web3ContextValue>(initialWeb3Context);
export const useWeb3Context: () => Web3ContextValue = () =>
  useContext(Web3Context);

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      rpc: {
        4: getNetworkByChainId(4).rpc_url,
      },
    },
  },
};
const web3Modal = new Web3Modal({
  cacheProvider: false,
  providerOptions,
});

const initialWeb3State = {
  account: "",
  providerChainId: 0,
};

export const Web3ContextProvider: React.FC = ({ children }) => {
  const [{ providerChainId, ethersProvider, account, cpk }, setWeb3State] =
    useState<Web3State>(initialWeb3State);
  const [connected, setConnected] = useState(false);
  const [idx, setIdx] = useState<IDXApi | null>(null);
  const [did, setDid] = useState<DID | null>(null);
  const [network, setNetwork] = useState<Network | null>(null);
  const setWeb3Provider = useCallback(
    async (initialProvider: any): Promise<void> => {
      try {
        const provider = new ethers.providers.Web3Provider(initialProvider);
        const { chainId } = initialProvider;
        const currentNetwork = await provider.getNetwork();
        setNetwork(currentNetwork);

        const signer = provider.getSigner();
        const gotAccount = await signer.getAddress();
        const isSafeApp = await web3Modal.isSafeApp();
        const ethLibAdapter = !isSafeApp
          ? new EthersAdapter({ ethers, signer })
          : null;
        const cpkInstance =
          process.env.REACT_APP_USE_CPK === "true" && ethLibAdapter
            ? await CPK.create({
                ethLibAdapter,
                ownerAccount: gotAccount,
              })
            : undefined;
        console.log("Use CPK?", process.env.REACT_APP_USE_CPK, cpkInstance);

        setWeb3State({
          account: gotAccount,
          ethersProvider: provider,
          providerChainId: chainId,
          cpk: cpkInstance,
        });
      } catch (error) {
        console.error(error);
      }
    },
    []
  );

  const connectToWeb3 = useCallback(async () => {
    web3Modal.clearCachedProvider();
    const modalProvider = await web3Modal.requestProvider();
    await setWeb3Provider(modalProvider);
    modalProvider.on("accountsChanged", (accounts: Array<string>) => {
      setWeb3State((_provider) => ({
        ..._provider,
        account: accounts[0],
      }));
      window.location.reload();
    });
    modalProvider.on("chainChanged", () => {
      /* setWeb3Provider(modalProvider); */
      console.log("Reloading");
      window.location.reload();
    });
    setConnected(true);
  }, [setWeb3Provider]);

  const disconnect = async () => {
    web3Modal.clearCachedProvider();
    setWeb3State(initialWeb3State);
    setConnected(false);
  };

  const getConnectText = useCallback(
    () =>
      account ? `${account.substr(0, 5)}... Connected` : "Connect to a Wallet",
    [account]
  );

  const get3IdProvider = useCallback(async () => {
    const authProvider = new EthereumAuthProvider(window.ethereum, account);

    const threeIdConnect = new ThreeIdConnect();
    await threeIdConnect.connect(authProvider);
    return threeIdConnect.getDidProvider();
  }, [account]);

  const authenticateCeramic = useCallback(async (): Promise<string> => {
    if (!account) {
      return "";
    }
    const ceramic = new Ceramic(process.env.REACT_APP_CERAMIC_URL);

    const threeIdProvider = await get3IdProvider();

    const aliases = {
      contributorProfile:
        "kjzl6cwe1jw14946qcgwbeixkh2ou9hwn29zv331akhfr61a44klf9ukg9jxz8g",
      contributorCSV:
        "kjzl6cwe1jw14agavukkr2w9qtay6eaxddurgvelnrnf7m74z1s2hofxp15dfea",
      guildCSVMapping:
        "kjzl6cwe1jw146k5uh5ayrozixpj99jeamsx0tcrc1dnwenshbc8r9ou44ckmin",
    };

    const resolver = new Resolver(
      {
        ...ThreeIdResolver.getResolver(ceramic),
        ...KeyDidResolver.getResolver(),
      },
      { cache: false }
    );
    const genDid = new DID({
      provider: threeIdProvider,
      resolver,
    });

    await genDid.authenticate();
    await ceramic.setDID(genDid);
    setDid(genDid);
    const genIdx = new IDX({ ceramic, aliases });
    setIdx(genIdx);
    return genIdx.id;
  }, [account, get3IdProvider]);

  const getBalanceOf = async (
    account: string,
    tokenAddress: string
  ): Promise<BigNumber> => {
    if (!ethersProvider) {
      throw new Error("Provider is not setup!");
    }
    if (tokenAddress === ethers.constants.AddressZero) {
      return await ethersProvider.getBalance(account);
    }
    // const signer = ethersProvider.getSigner();
    const erc20 = new ethers.Contract(tokenAddress, ERC20Abi, ethersProvider);
    return BigNumber.from((await erc20.balanceOf(account)).toString());
  };

  const getProxyBalance = async (tokenAddress: string): Promise<BigNumber> => {
    if (!ethersProvider || !cpk) {
      throw new Error("Provider is not setup!");
    }

    if (tokenAddress === ethers.constants.AddressZero) {
      // TODO: This should be used after https://github.com/gnosis/contract-proxy-kit/pull/150 is merged
      // const balance = await cpk.getBalance();
      const balance = await (
        cpk.ethLibAdapter as EthersAdapter
      ).signer.provider.getBalance(cpk.address); // quick fix
      return balance.toString() === "NaN"
        ? BigNumber.from("0")
        : BigNumber.from(balance.toString());
    }

    const signer = ethersProvider.getSigner();
    const erc20 = new ethers.Contract(tokenAddress, ERC20Abi, signer);
    const balance = await erc20.balanceOf(cpk.address);
    return BigNumber.from(balance.toString());
  };

  const fundProxy = async (
    tokenAddress: string,
    value: string
  ): Promise<void> => {
    if (!ethersProvider || !cpk) {
      throw new Error("Provider is not setup!");
    }
    const signer = ethersProvider.getSigner();
    if (tokenAddress === ethers.constants.AddressZero) {
      const tx = await signer.sendTransaction({
        to: cpk.address,
        value: ethers.BigNumber.from(value),
      });
      console.log("Waiting for confirmation...");
      await tx.wait(1);
      return;
    }
    const erc20 = new ethers.Contract(tokenAddress, ERC20Abi, signer);
    const tx = await erc20.transfer(cpk.address, value);
    console.log("Waiting for confirmation...");
    await tx.wait(1);
  };

  const setupCPKModules = async (
    tokenAddress: string,
    deposit: string,
    delegateContract: string
  ): Promise<Array<Transaction>> => {
    if (!ethersProvider || !cpk) {
      throw new Error("Provider is not setup!");
    }

    const { gnosisConfig } = getNetworkByChainId(providerChainId);
    /* const iErc20 = new ethers.utils.Interface(ERC20Abi); */

    const signer = ethersProvider.getSigner();
    const isDeployed = await cpk.isProxyDeployed();

    if (isDeployed) {
      const safeVersion = await cpk.getContractVersion();
      const balance = await cpk.getBalance();
      const modules = await cpk.getModules();
      const owner = await cpk.getOwnerAccount();
      console.log(
        "CPK",
        cpk,
        cpk?.address,
        isDeployed,
        owner,
        safeVersion,
        balance.toString(10),
        modules
      );
    }

    console.log("STEP 1: Check for AllowanceModule");
    const hasAllowanceModule =
      isDeployed &&
      ((await cpk.getContractVersion()) !== "1.1.1"
        ? await cpk.isModuleEnabled(gnosisConfig.allowanceModule)
        : (await cpk.getModules()).includes(gnosisConfig.allowanceModule));
    console.log("hasAllowanceModule", hasAllowanceModule);

    // Delegate MUST be a GuildApp contract
    const delegate = delegateContract;

    console.log("STEP: 2: Check if owner is a delegate");
    const allowanceModule = new ethers.Contract(
      gnosisConfig.allowanceModule,
      AllowanceModuleAbi,
      signer
    );
    const delegates = await allowanceModule.getDelegates(cpk.address, 0, 10);
    const isDelegate = delegates.results.includes(delegate);
    console.log("Delegates", delegates, isDelegate);

    const currentDate = new Date();
    const currentPeriod = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const blockNo = await ethersProvider.getBlockNumber();
    const block = await ethersProvider.getBlock(blockNo);
    console.log(block.timestamp, (currentPeriod.getTime() / 1000).toFixed(0));

    console.log("STEP 3: Check allowance");
    const allowance = await allowanceModule.allowances(
      cpk.address,
      delegate,
      tokenAddress
    );
    console.log("Current Allowance", allowance, allowance.amount.toString());
    const allowanceAmount = (allowance.amount as ethers.BigNumber)
      .add(ethers.BigNumber.from(deposit))
      .toString();

    const txs = [
      !hasAllowanceModule && {
        operation: CPK.Call,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        to: cpk?.address!,
        value: 0,
        data: await cpk.contractManager?.versionUtils?.encodeEnableModule(
          gnosisConfig.allowanceModule
        ),
      },
      !isDelegate && {
        operation: CPK.Call,
        to: gnosisConfig.allowanceModule,
        value: 0,
        data: allowanceModule.interface.encodeFunctionData("addDelegate", [
          delegate,
        ]),
      },
      {
        operation: CPK.Call,
        to: gnosisConfig.allowanceModule,
        value: 0,
        data: allowanceModule.interface.encodeFunctionData("setAllowance", [
          delegate,
          tokenAddress,
          allowanceAmount,
          SUBSCRIPTION_PERIOD_DEFAULT, // Get time in minutes
          (currentPeriod.getTime() / 1000 / 60).toFixed(0), // First day of current Period. Get time in minutes
        ]),
      },
    ].filter((t) => t) as Array<Transaction>;

    console.log("Txs to be included", txs.length, txs);

    return txs;
  };

  const encodeAllowanceModuleCall = (
    functionName: string,
    args: Array<string>
  ): Array<Transaction> => {
    if (!ethersProvider || !cpk) {
      throw new Error("Provider is not setup!");
    }

    const { gnosisConfig } = getNetworkByChainId(providerChainId);
    const signer = ethersProvider.getSigner();

    const allowanceModule = new ethers.Contract(
      gnosisConfig.allowanceModule,
      AllowanceModuleAbi,
      signer
    );

    return [
      {
        // operation: 0, // CPK.Call by default
        to: allowanceModule.address,
        value: "0",
        data: allowanceModule.interface.encodeFunctionData(functionName, args),
      },
    ];
  };

  const signTransfer = async (
    guildAddress: string,
    tokenAddress: string,
    contributionValue: string
  ): Promise<string> => {
    if (!ethersProvider || !cpk) {
      throw new Error("Provider is not setup!");
    }
    const { gnosisConfig } = getNetworkByChainId(providerChainId);
    // const domain = {
    //   chainId: providerChainId,
    //   verifyingContract: gnosisConfig.allowanceModule,
    // };
    // const types = {
    //   AllowanceTransfer: [
    //     { type: "address", name: "safe" },
    //     { type: "address", name: "token" },
    //     { type: "address", name: "to" },
    //     { type: "uint96", name: "amount" },
    //     { type: "address", name: "paymentToken" },
    //     { type: "uint96", name: "payment" },
    //     { type: "uint16", name: "nonce" },
    //   ],
    // };

    const signer = ethersProvider.getSigner();
    const allowanceModule = new ethers.Contract(
      gnosisConfig.allowanceModule,
      AllowanceModuleAbi,
      signer
    );

    // TODO: set Guild as delegate
    const delegate = await signer.getAddress();

    const allowance = await allowanceModule.allowances(
      cpk.address,
      delegate,
      tokenAddress
    );

    console.log(
      "Signature params",
      cpk.address,
      tokenAddress,
      guildAddress,
      contributionValue,
      ethers.constants.AddressZero,
      0,
      allowance.nonce
    );
    const transferHash = await allowanceModule.generateTransferHash(
      cpk.address,
      tokenAddress,
      guildAddress,
      contributionValue,
      ethers.constants.AddressZero,
      0,
      allowance.nonce
    );
    console.log("TransferHash", transferHash);

    // TODO: Fix bug with EIP712 signature
    // const signature = await signer._signTypedData(domain, types, transferHash);
    const signature = await signer.signMessage(transferHash);
    console.log("STEP 4: Store this Signature **IMPORTANT**", signature);

    // const recoveredAddress = ethers.utils.verifyTypedData(domain, types, transferHash, signature);
    // console.log('EQUAL ?', recoveredAddress === await signer.getAddress());

    return signature;
  };

  const submitCPKTx = async (
    txs: Array<Transaction>
  ): Promise<ethers.providers.TransactionResponse | null> => {
    if (!cpk) {
      throw new Error("CPK was not setup!");
    }
    console.log("submitCPKTx", txs.length, txs);
    if (txs.length > 0) {
      console.log("Exec...");
      try {
        const cpkTxRs = await cpk.execTransactions(txs);
        return cpkTxRs.transactionResponse as ethers.providers.TransactionResponse;
      } catch (error) {
        console.error("Something wrong happened", error);
        throw new Error(error);
      }
    }
    console.error("No batch Txs sent", txs);
    throw new Error("No batch Txs sent");
  };

  useEffect(() => {
    (async (): Promise<void> => {
      if (await web3Modal.isSafeApp()) {
        connectToWeb3();
      }
    })();
  }, [connectToWeb3]);

  let values = {
    connectToWeb3,
    authenticateCeramic,
    disconnect,
    getBalanceOf,
    getProxyBalance,
    fundProxy,
    setupCPKModules,
    encodeAllowanceModuleCall,
    signTransfer,
    submitCPKTx,
    ethersProvider,
    cpk,
    account,
    providerChainId,
    getConnectText,
    connected,
    network,
  } as Web3ContextValue;

  if (idx) {
    values = { idx, ...values };
  }

  if (did) {
    values = { did, ...values };
  }

  return <Web3Context.Provider value={values}>{children}</Web3Context.Provider>;
};
