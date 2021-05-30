import { request, gql } from "graphql-request";

import { getNetworkByChainId } from "./networks";

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
