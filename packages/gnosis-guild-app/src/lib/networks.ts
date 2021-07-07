import { API_KEY } from "../constants";

type GnosisConfig = {
  allowanceModule: string;
};

type Network = {
  name: string;
  guildFactory: string;
  daiToken: string;
  subgraphUrl: string;
  rpc_url: string;
  gnosisConfig: GnosisConfig;
};

type Networks = {
  [key: number]: Network;
};

const Default = {
  name: "Rinkeby",
  guildFactory: "0xe9351c19Eca25169FE9511e439BD8ECfa29bE467",
  daiToken: "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea",
  subgraphUrl:
    "https://api.thegraph.com/subgraphs/name/santteegt/gnosis-guild-app-rinkeby",
  rpc_url: `https://rinkeby.infura.io/v3/${API_KEY}`,
  gnosisConfig: {
    allowanceModule: "0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134",
  },
};

const networks: Networks = {
  1: {
    name: "Mainnet",
    guildFactory: "",
    daiToken: "",
    subgraphUrl: "",
    rpc_url: `https://mainnet.infura.io/v3/${API_KEY}`,
    gnosisConfig: {
      allowanceModule: "0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134",
    },
  },
  4: {
    name: "Rinkeby",
    guildFactory: "0xe9351c19Eca25169FE9511e439BD8ECfa29bE467",
    daiToken: "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea",
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/santteegt/gnosis-guild-app-rinkeby",
    rpc_url: `https://rinkeby.infura.io/v3/${API_KEY}`,
    gnosisConfig: {
      allowanceModule: "0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134",
    },
  },
};

export const getNetworkByChainId = (chainId: number): Network => {
  const network = networks[chainId];
  return network || Default;
};

export const getIsValidChain = (chainId: number): Network => {
  const network = networks[chainId];
  return network;
};
