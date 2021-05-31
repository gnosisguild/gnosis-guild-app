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
  guildAppTemplate: "0x07bf9bAAfAAa37E99F0af80c3Ebc15d7bD7dfA33",
  guildFactory: "0x869Fd2aC48965469a2a76f84095b4310377fb4Cb",
  daiToken: "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea",
  subgraphUrl:
    "https://api.thegraph.com/subgraphs/name/santteegt/gnosis-guild-app-rinkeby"
};

const networks: Networks = {
  4: {
    name: "Rinkeby",
    guildAppTemplate: "0x07bf9bAAfAAa37E99F0af80c3Ebc15d7bD7dfA33",
    guildFactory: "0x869Fd2aC48965469a2a76f84095b4310377fb4Cb",
    daiToken: "0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea",
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/santteegt/gnosis-guild-app-rinkeby"
  }
};

export const getNetworkByChainId = (chainId: number): Network => {
  const network = networks[chainId];
  return network ? network : Default;
};
