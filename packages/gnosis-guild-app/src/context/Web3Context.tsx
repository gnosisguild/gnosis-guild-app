import React, { useContext, useCallback, useState } from "react";
import Web3Modal from "web3modal";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers } from "ethers";

export type Web3ContextValue = {
  connectToWeb3: () => void;
  disconnect: () => void;
  ethersProvider: ethers.providers.Provider;
  account: string;
  providerChainId: number;
};

const initialWeb3Context = {
  connectToWeb3: () => {},
  disconnect: () => {},
  ethersProvider: ethers.getDefaultProvider(),
  account: "",
  providerChainId: 0,
};

export const Web3Context =
  React.createContext<Web3ContextValue>(initialWeb3Context);
export const useWeb3Context = () => useContext(Web3Context);

// Just follow the omnibridge example
// keep it simple for now

// Start with only supporting mainnet and Rinkeby
/* const provider = ethers.getDefaultProvider(); */
console.log("Network");
const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: "e8de7c0731d140159e5a1a2c74c59c65",
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
      console.log("Here");
      try {
        /* const web3Provider = new Web3(initialProvider); */
        const provider = new ethers.providers.Web3Provider(initialProvider);
        console.log(await provider.getSigner());
        const chainId = initialProvider.chainId;

        const signer = provider.getSigner();
        const gotAccount = await signer.getAddress();
        setWeb3State({
          account: gotAccount,
          ethersProvider: provider,
          providerChainId: chainId,
        });
      } catch (error) {
        console.log("Here 2");
        console.error(error);
      }
    },
    []
  );
  // Add event handlers
  // Add disconnect function
  // Possibly autoload stuff, but maybe that is a todo
  const connectToWeb3 = useCallback(async () => {
    console.log("Before connect");
    console.log(web3Modal);
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
  }, [web3Modal]);

  const disconnect = useCallback(async () => {
    web3Modal.clearCachedProvider();
    setWeb3State(initialWeb3State);
  }, []);

  console.log(ethersProvider);
  console.log(account);
  console.log(providerChainId);
  console.log("web3Context");
  return (
    <Web3Context.Provider
      value={{
        connectToWeb3,
        disconnect,
        ethersProvider,
        account,
        providerChainId,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
