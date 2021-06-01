import { useCallback } from "react";
import { request, gql } from "graphql-request";
import { getNetworkByChainId } from "../lib/networks";
import { Contract, ethers } from "ethers";
import { GuildMetadata } from "../context/GuildContext";

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
};

export const useGuild = () => {
  const fetchGuildByAddress = useCallback(
    async (address: string, chainId: number): Promise<Array<GraphGuild>> => {
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
      if (resp && resp.guilds && resp.guilds.length > 0) {
        return resp.guilds;
      }
      return [];
    },
    []
  );

  const createGuild = useCallback(
    (
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
      const subscriptionTime = 30 * 24 * 60 * 60; // 30 days
      const functionArgs = [
        creatorAddress,
        tokenAddress,
        guildInfo.amount,
        subscriptionTime,
        [guildInfo.name, guildInfo.currency, "", ""]
      ];
      const iface = new ethers.utils.Interface(guildAppAbi);
      const calldata = iface.encodeFunctionData("initialize", functionArgs);

      const factoryAbi = [
        "function createGuild(bytes calldata _initData) public "
      ];
      const guildAppContract = new Contract(
        network.guildFactory,
        factoryAbi,
        ethersProvider.getSigner()
      );
      guildAppContract
        .createGuild(calldata)
        .catch((err: Error) => console.error(`Failed to create guild: ${err}`));
    },
    []
  );
  return { fetchGuildByAddress, createGuild };
};
