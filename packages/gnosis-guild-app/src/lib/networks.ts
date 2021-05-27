export const LOCAL_CONFIG = {
  guildFactoryAddress: process.env.GUILD_FACTORY_ADDRESS,
  guildAppAddress: process.env.GUILD_APP_ADDRESS,
};

const networkConfigs = {
  31337: LOCAL_CONFIG,
};

// What if a non-existent network id is passed
export const getNetworkConfigs = (chainId: number) => {
  return networkConfigs[chainId];
};
