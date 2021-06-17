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
import KeyDidResolver from "key-did-resolver";





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
  const [did, setDid] = useState<DID | null>(null);
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
    const authProvider = new EthereumAuthProvider(window.ethereum, account);
    await threeIdConnect.connect(authProvider);
		return threeIdConnect.getDidProvider()
  };

  const authenticateCeramic = async (): Promise<string> => {
		if (!account) {
			return ""
		}
     const ceramic = await new Ceramic("https://ceramic-clay.3boxlabs.com") as CeramicApi

		const threeIdProvider = await get3IdProvider()
		const aliases = {
			contributorProfile: "kjzl6cwe1jw14946qcgwbeixkh2ou9hwn29zv331akhfr61a44klf9ukg9jxz8g", contributorCSV: "kjzl6cwe1jw14agavukkr2w9qtay6eaxddurgvelnrnf7m74z1s2hofxp15dfea",
			guildCSVMapping: "kjzl6cwe1jw146k5uh5ayrozixpj99jeamsx0tcrc1dnwenshbc8r9ou44ckmin"
		}

		const resolver = new Resolver({ ...ThreeIdResolver.getResolver(ceramic), ...KeyDidResolver.getResolver() })
    const did = new DID({ provider: threeIdProvider , resolver })

		await did.authenticate()
		await ceramic.setDID(did)
		setDid(did)
    const idx = new IDX({ ceramic, aliases })
		setIdx(idx)
		// This may be useful ceramic.did
    return idx.id
	};

//ceramic://k3y52l7qbv1frxqhleytedd1kz4si2p3goyxyq2j1u3b1hy486ilnzrk0qc1x588w

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

 if (did) {
	 values = {did: did, ...values}
	}

  return (
    <Web3Context.Provider
      value={values}
    >
      {children}
    </Web3Context.Provider>
  );
};
