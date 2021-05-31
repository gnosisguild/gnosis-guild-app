import { Contract, ethers } from "ethers";
import { request, gql } from "graphql-request";

import { getNetworkByChainId } from "./networks";
import { GuildMetadata } from "../context/GuildContext";

export const fetchGuildByAddress: any = async (
  address: string,
  chainId: number
) => {
  const fetchGuildQuery = gql`
    query getGuildByOwner($ownerAddress: String) {
      guilds(where: { owner: $ownerAddress }) {
        id
        owner
        name
        symbol
        metadataURI
        active
        tokenAddress
        currentPrice
        subsPeriod
        currentBalance
        totalSubscriptions
        subscriptions
      }
    }
  `;
  const network = getNetworkByChainId(chainId);
  const resp = await request(network.subgraphUrl, fetchGuildQuery, {
    ownerAddress: address
  }).catch(e => {
    console.error(e);
    console.error("Failed call");
  });
  console.log("Fetched guilds");
  console.log(resp);
  return resp;
};

// TODO: Move these to a hook
export const createGuild = (
  chainId: number,
  ethersProvider: ethers.providers.Web3Provider,
  guildInfo: GuildMetadata,
  creatorAddress: string
) => {
  const network = getNetworkByChainId(chainId);

  const guildAppAbi = [
    "function initialize(address _creator, address _tokenAddress, uint256 _subPrice, uint256 _subscriptionPeriod, tuple(string, string, string, string) memory _metadata) public"
  ];
  let tokenAddress = "0x0000000000000000000000000000000000000000";
  if (guildInfo.currency === "Dai") {
    tokenAddress = network.daiToken;
  }
  const subscriptionTime = 30 * 24 * 60 * 60;
  const functionArgs = [
    creatorAddress,
    tokenAddress,
    guildInfo.amount,
    subscriptionTime,
    [guildInfo.name, guildInfo.currency, "", ""]
  ];
  const iface = new ethers.utils.Interface(guildAppAbi);
  const calldata = iface.encodeFunctionData("initialize", functionArgs);
  console.log(network);

  const factoryAbi = ["function createGuild(bytes calldata _initData) public "];
  const guildAppContract = new Contract(
    network.guildFactory,
    factoryAbi,
    ethersProvider.getSigner()
  );
  guildAppContract
    .createGuild(calldata)
    .catch((err: Error) => console.error(`Failed to create guild: ${err}`));
};
