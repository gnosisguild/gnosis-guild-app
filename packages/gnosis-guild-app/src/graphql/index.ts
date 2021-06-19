import { request, gql } from "graphql-request";

import { getNetworkByChainId } from "../lib/networks";

export type GraphGuild = {
  active: boolean;
  currentBalance: number;
  currentPrice: number;
  id: string;
  metadataURI: string;
  name: string;
  owner: string;
  subsPeriod: number;
  subscriptions: Array<any>;
  symbol: string;
  tokenAddress: string;
  totalSubscriptions: number;
  totalSubscribers: number;
};

export type Payment = {
  value: number;
};

export type GraphSubscriber = {
  id: string;
  owner: string;
  paymentHistory: Array<Payment>;
};

const guildBaseFields = `
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
    totalSubscribers
    totalSubscriptions
`;

export const fetchGuildByAddress = async (
  address: string,
  chainId: number
): Promise<Array<GraphGuild>> => {
  const fetchGuildQuery = gql`
      query getGuildByOwner($ownerAddress: String) {
        guilds(where: { owner: $ownerAddress, active: true }) {
          ${guildBaseFields}
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
  if (resp && resp.guilds && resp.guilds.length > 0) {
    return resp.guilds;
  }
  return [];
};

export const fetchGuild = async (
  guildId: string,
  chainId: number
): Promise<GraphGuild | null> => {
  const fetchGuildQuery = gql`
      query getGuild($id: String) {
        guild(id: $id) {
            ${guildBaseFields}
            subscriptions {
                id
            }
        }
      }
    `;
  const network = getNetworkByChainId(chainId);
  const resp = await request(network.subgraphUrl, fetchGuildQuery, {
    id: guildId.toLowerCase()
  }).catch(e => {
    console.error(e);
    console.error("Failed call");
  });
  if (resp && resp.guild) {
    return resp.guild;
  }
  return null;
};

export const fetchSubscriberByGuild = async (
  guildId: string,
  subscriberAddress: string,
  chainId: number
): Promise<Array<GraphSubscriber> | null> => {
  const fetchGuildQuery = gql`
    query getContributors($owner: String, $date: String, $guild: String) {
      guildSubscriptions(
        where: { expires_gte: $date, guild: $guild, owner: $owner }
      ) {
        id
        owner
        paymentHistory(orderBy: purchasedAt, orderDirection: desc) {
          value
        }
      }
    }
  `;

  const network = getNetworkByChainId(chainId);
  const resp = await request(network.subgraphUrl, fetchGuildQuery, {
    date: Date.now()
      .toString()
      .substr(0, 10),
    guild: guildId,
    owner: subscriberAddress
  }).catch(e => {
    console.error(e);
    console.error("Failed to fetch subscriber from subgraph");
  });
  if (resp && resp.guildSubscriptions) {
    return resp.guildSubscriptions;
  }
  return null;
};
