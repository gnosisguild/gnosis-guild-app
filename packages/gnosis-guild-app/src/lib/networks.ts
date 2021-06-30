import { API_KEY } from "../constants";

type Network = {
  name: string;
  guildFactory: string;
  daiToken: string;
  subgraphUrl: string;
  rpc_url: string;
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
};

export const networks: Networks = {
  4: {
    name: "Rinkeby",
    guildFactory: "0xe9351c19Eca25169FE9511e439BD8ECfa29bE467",
    daiToken: "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea",
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/santteegt/gnosis-guild-app-rinkeby",
    rpc_url: `https://rinkeby.infura.io/v3/${API_KEY}`,
  },
};

export const getNetworkByChainId = (chainId: number): Network => {
  const network = networks[chainId];
  return network ? network : Default;
};
