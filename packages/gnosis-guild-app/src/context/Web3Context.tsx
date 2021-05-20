import React, { useContext, useCallback, useState } from "react";
import Web3Modal from "web3modal";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers } from "ethers";

import { networks } from "../constants";

export type Web3ContextValue = {
  connectToWeb3: () => void;
  disconnect: () => void;
  getConnectText: () => string;
  ethersProvider: ethers.providers.Provider;
  account: string;
  providerChainId: number;
};

const initialWeb3Context = {
  connectToWeb3: () => {},
  disconnect: () => {},
  getConnectText: () => "",
  ethersProvider: ethers.getDefaultProvider(),
  account: "",
  providerChainId: 0,
};

export const Web3Context =
  React.createContext<Web3ContextValue>(initialWeb3Context);
export const useWeb3Context = () => useContext(Web3Context);

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      rpc: {
        1: networks[1].rpc_url,
        4: networks[4].rpc_url,
      },
    },
  },
};
const web3Modal = new Web3Modal({
  cacheProvider: true,

  providerOptions: providerOptions,
  disableInjectedProvider: false,
});

const initialWeb3State = {
  ethersProvider: ethers.getDefaultProvider(),
  account: "",
  providerChainId: 0,
};

export const Web3ContextProvider: React.FC = ({ children }) => {
  const [{ providerChainId, ethersProvider, account }, setWeb3State] =
    useState(initialWeb3State);
  const setWeb3Provider = useCallback(
    async (initialProvider: any): Promise<void> => {
      try {
        const provider = new ethers.providers.Web3Provider(initialProvider);
        const chainId = initialProvider.chainId;

        const signer = provider.getSigner();
        const gotAccount = await signer.getAddress();
        setWeb3State({
          account: gotAccount,
          ethersProvider: provider,
          providerChainId: chainId,
        });
      } catch (error) {
        console.error(error);
      }
    },
    []
  );

  const connectToWeb3 = useCallback(async () => {
    web3Modal.clearCachedProvider();
    const modalProvider = await web3Modal.connect();
    await setWeb3Provider(modalProvider);
    modalProvider.on("accountsChanged", (accounts: Array<string>) => {
      setWeb3State((_provider) => ({
        ..._provider,
        account: accounts[0],
      }));
    });
    modalProvider.on("chainChanged", () => {
      setWeb3Provider(modalProvider);
    });
  }, [setWeb3Provider]);

  const disconnect = useCallback(async () => {
    web3Modal.clearCachedProvider();
    setWeb3State(initialWeb3State);
  }, []);

  const getConnectText = useCallback(() => {
    return account ? `${account.substr(0, 5)}... Connected` : "Connect";
  }, [account]);

  return (
    <Web3Context.Provider
      value={{
        connectToWeb3,
        disconnect,
        ethersProvider,
        account,
        providerChainId,
        getConnectText,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
