import { request, gql } from "graphql-request";

import { getNetworkByChainId } from "../lib/networks";

export type GuildBalance = {
  addedAt: string;
  tokenAddress: string;
  currentBalance: number;
  totalSubscriptions: number;
};

export type GuildWithdrawal = {
  id: string;
  tokenAddress: string;
  value: number;
  beneficiary: string;
};

export type GraphGuild = {
  active: boolean;
  currentPrice: number;
  id: string;
  metadataURI: string;
  name: string;
  owner: string;
  subsPeriod: number;
  subscriptions: Array<any>;
  symbol: string;
  lastMetadataUpdate: number;
  tokenAddress: string;
  totalSubscribers: number;
  balances: Array<GuildBalance>;
  withdrawals: Array<GuildWithdrawal>;
};

export type Payment = {
  value: number;
};

export type GraphSubscriber = {
  id: string;
  active: boolean;
  unsubscribedAt: string;
  owner: string;
  paymentHistory: Array<Payment>;
  keyId: number;
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
		lastMetadataUpdate
    subsPeriod
    totalSubscribers
    balances {
      tokenAddress
      currentBalance
      totalSubscriptions
    }
    withdrawals {
      tokenAddress
      value
      beneficiary
    }
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
    ownerAddress: address,
  }).catch((e) => {
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
    id: guildId.toLowerCase(),
  }).catch((e) => {
    console.error(e);
    console.error("Failed call");
  });
  if (resp && resp.guild) {
    return resp.guild;
  }
  return null;
};

export const fetchSubscription = async (
  guildId: string,
  subscriber: string,
  chainId: number,
): Promise<any | null> => {
  const fetchGuildSubscriptionQuery = gql`
    query getGuildSubscription($id: String) {
      guildSubscription(id: $id) {
        id
        active
        unsubscribedAt
        createdAt
        guild {
          id
        }
        keyId,
        owner,
        expires,
        paymentHistory {
          id
          purchasedAt
          value
        }
      }
    }
  `;
  const network = getNetworkByChainId(chainId);
  const resp = await request(network.subgraphUrl, fetchGuildSubscriptionQuery, {
    id: `${guildId.toLowerCase()}-${subscriber.toLowerCase()}`
  }).catch(e => {
    console.error(e);
    console.error("Failed call");
  });
  if (resp && resp.guildSubscription) {
    return resp.guildSubscription;
  }
  return null;

}

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
        active
        unsubscribedAt
        owner
        keyId
        paymentHistory(orderBy: purchasedAt, orderDirection: desc) {
          value
        }
      }
    }
  `;

  const network = getNetworkByChainId(chainId);
  const resp = await request(network.subgraphUrl, fetchGuildQuery, {
    date: Date.now().toString().substr(0, 10),
    guild: guildId,
    owner: subscriberAddress,
  }).catch((e) => {
    console.error(e);
    console.error("Failed to fetch subscriber from subgraph");
  });
  if (resp && resp.guildSubscriptions) {
    return resp.guildSubscriptions;
  }
  return null;
};
