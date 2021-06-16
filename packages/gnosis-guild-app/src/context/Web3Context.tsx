import React, { useContext, useCallback, useEffect, useState } from "react";
import { SafeAppWeb3Modal as Web3Modal } from "@gnosis.pm/safe-apps-web3modal";

import { EthereumAuthProvider, ThreeIdConnect } from "@3id/connect";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers } from "ethers";
import type { CeramicApi } from '@ceramicnetwork/common'
import Ceramic from '@ceramicnetwork/http-client'
import { IDX } from '@ceramicstudio/idx'
import type { IDX as IDXApi } from '@ceramicstudio/idx'
import { DID, DIDProvider } from 'dids'
import {Resolver} from 'did-resolver'
import ThreeIdResolver from "@ceramicnetwork/3id-did-resolver";




import { networks } from "../constants";

export type Web3ContextValue = {
  connectToWeb3: () => void;
	authenticateCeramic: () => Promise<string>;
  disconnect: () => void;
  getConnectText: () => string;
  ethersProvider: ethers.providers.Web3Provider;
  account: string;
  providerChainId: number;
  idx?: IDXApi;
  did?: DID;
};

const initialWeb3Context = {
  connectToWeb3: () => {},
	authenticateCeramic: async () => "",
  disconnect: () => {},
  getConnectText: () => "",
  ethersProvider: new ethers.providers.Web3Provider(window.ethereum),
  account: "",
  providerChainId: 0,
};

export const Web3Context = React.createContext<Web3ContextValue>(
  initialWeb3Context
);
export const useWeb3Context = () => useContext(Web3Context);

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      rpc: {
        1: networks[1].rpc_url,
        4: networks[4].rpc_url
      }
    }
  }
};
const web3Modal = new Web3Modal({
  cacheProvider: true,

  providerOptions: providerOptions,
  disableInjectedProvider: false
});


const threeIdConnect = new ThreeIdConnect();

const initialWeb3State = {
  ethersProvider: new ethers.providers.Web3Provider(window.ethereum),
  account: "",
  providerChainId: 0
};

export const Web3ContextProvider: React.FC = ({ children }) => {
  const [{ providerChainId, ethersProvider, account }, setWeb3State] = useState(
    initialWeb3State
  );
  const [idx, setIdx] = useState<IDXApi | null>(null);
  const setWeb3Provider = useCallback(async (initialProvider: any): Promise<
    void
  > => {
    try {
      const provider = new ethers.providers.Web3Provider(initialProvider);
      const chainId = initialProvider.chainId;

      const signer = provider.getSigner();
      const gotAccount = await signer.getAddress();
      setWeb3State({
        account: gotAccount,
        ethersProvider: provider,
        providerChainId: chainId
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  const connectToWeb3 = useCallback(async () => {
    web3Modal.clearCachedProvider();
    const modalProvider = await web3Modal.requestProvider();
    await setWeb3Provider(modalProvider);
    modalProvider.on("accountsChanged", (accounts: Array<string>) => {
      setWeb3State(_provider => ({
        ..._provider,
        account: accounts[0]
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
    return account
      ? `${account.substr(0, 5)}... Connected`
      : "Connect to a Wallet";
  }, [account]);

  const get3IdProvider = async () => {
		console.log(ethersProvider)
		console.log(account)
    const authProvider = new EthereumAuthProvider(window.ethereum, account);
		console.log(authProvider)
		const x = await authProvider.accountId()
		console.log("AccountId")
		console.log(x)
    await threeIdConnect.connect(authProvider);
		console.log("Conected")
		return threeIdConnect.getDidProvider()
  };

  const authenticateCeramic = async (): Promise<string> => {
		if (!account) {
			return ""
		}
		console.log("account")
		console.log(account)
     const ceramic = await new Ceramic("https://ceramic-clay.3boxlabs.com") as CeramicApi

		const threeIdProvider = await get3IdProvider()
		console.log("Got provider")
		const aliases = {
			contributorProfile: "kjzl6cwe1jw147hrqhk7ho3awg5cf3l4x83y2e7l2thcemakdxv5eti8bwhklui",
			contributorCSV: "kjzl6cwe1jw1475xzl8f0zydr6dinz0akseglx7hja6a13na2l29hh65knps18b",
			guildCSVMapping: "kjzl6cwe1jw146k5uh5ayrozixpj99jeamsx0tcrc1dnwenshbc8r9ou44ckmin"
		}

		console.log(ceramic)
		const resolver = new Resolver({ ...ThreeIdResolver.getResolver(ceramic) })
    const did = new DID({ provider: threeIdProvider , resolver })

		await did.authenticate()
		await ceramic.setDID(did)
    const idx = new IDX({ ceramic, aliases })
		setIdx(idx)
		// This may be useful ceramic.did
    return idx.id
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
        ethersProvider,
        account,
        providerChainId,
        getConnectText
      } as Web3ContextValue
	if (idx) {
		values = {idx: idx, ...values}
	}

  return (
    <Web3Context.Provider
      value={values}
    >
      {children}
    </Web3Context.Provider>
  );
};
