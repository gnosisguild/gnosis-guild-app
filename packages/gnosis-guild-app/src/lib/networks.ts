type Network = {
  name: string;
  guildAppTemplate: string;
  guildFactory: string;
  daiToken: string;
  subgraphUrl: string;
};

type Networks = {
  [key: number]: Network;
};

const Default = {
  name: "Rinkeby",
  guildAppTemplate: "0x14f103b4eaD58431f8B148aaAb4A896B3B16E21b",
  guildFactory: "0x032001772d52fa4a88b43AAC8dc8B73F28aEF6A4",
  daiToken: "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea",
  subgraphUrl:
    "https://api.thegraph.com/subgraphs/name/santteegt/gnosis-guild-app-rinkeby"
};

const networks: Networks = {
  4: {
    name: "Rinkeby",
    guildAppTemplate: "0x14f103b4eaD58431f8B148aaAb4A896B3B16E21b",
    guildFactory: "0x032001772d52fa4a88b43AAC8dc8B73F28aEF6A4",
    daiToken: "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea",
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/santteegt/gnosis-guild-app-rinkeby"
  }
};

export const getNetworkByChainId = (chainId: number): Network => {
  const network = networks[chainId];
  return network ? network : Default;
};
