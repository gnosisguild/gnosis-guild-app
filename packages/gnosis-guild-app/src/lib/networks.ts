type Network = {
  name: string;
  guildAppTemplate: string;
  guildFactory: string;
  subgraphUrl: string;
};

type Networks = {
  [key: number]: Network;
};

const Default = {
  name: "Rinkeby",
  guildAppTemplate: "0x1250AB83c5A978E37C9A59C86074528A92298008",
  guildFactory: "0x4372Bff493245729E484Ed858e0D6F2C4fe715C7",
  subgraphUrl:
    "https://api.thegraph.com/subgraphs/name/santteegt/gnosis-guild-app-rinkeby"
};

const networks: Networks = {
  4: {
    name: "Rinkeby",
    guildAppTemplate: "0x1250AB83c5A978E37C9A59C86074528A92298008",
    guildFactory: "0x4372Bff493245729E484Ed858e0D6F2C4fe715C7",
    subgraphUrl:
      "https://api.thegraph.com/subgraphs/name/santteegt/gnosis-guild-app-rinkeby"
  }
};

export const getNetworkByChainId = (chainId: number): Network => {
  const network = networks[chainId];
  return network ? network : Default;
};
