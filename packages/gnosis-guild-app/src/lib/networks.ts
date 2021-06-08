type Network = {
  name: string;
  guildFactory: string;
  daiToken: string;
  subgraphUrl: string;
};

type Networks = {
  [key: number]: Network;
};

const Default = {
  name: "Rinkeby",
  guildFactory: "0xa99B73A665EF495D61F32138A2cfC49526F28425",
  daiToken: "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea",
  subgraphUrl:
    "https://api.thegraph.com/subgraphs/name/santteegt/gnosis-guild-app-rinkeby"
};

const networks: Networks = {
  4: {
    name: "Rinkeby",
    guildFactory: "0xa99B73A665EF495D61F32138A2cfC49526F28425",
    daiToken: "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea",
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/santteegt/gnosis-guild-app-rinkeby"
  }
};

export const getNetworkByChainId = (chainId: number): Network => {
  const network = networks[chainId];
  return network ? network : Default;
};
