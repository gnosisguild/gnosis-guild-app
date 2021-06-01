import React, { useCallback } from "react";
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
  // TODO: change type to subscription
  subscriptions: Array<any>;
  symbol: string;
  tokenAddress: string;
  totalSubscriptions: number;
};
// active: true
// currentBalance: "0"
// currentPrice: "0"
// id: "0x3cdd87550b95c01adfe1fc7ec9b0f1c34435cf2b"
// metadataURI: ""
// name: ""
// owner: "0x4393efe7c3fdb3af425d81099eade299c05967b4"
// subsPeriod: "2592000"
// subscriptions: Array(0)
// length: 0
// __proto__: Array(0)
// symbol: "ETH"
// tokenAddress: "0x0000000000000000000000000000000000000000"
// totalSubscriptions: "0"

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
      console.log("Fetched guilds");
      console.log(resp);
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
      const subscriptionTime = 30 * 24 * 60 * 60;
      const functionArgs = [
        creatorAddress,
        tokenAddress,
        guildInfo.amount,
        subscriptionTime,
        [guildInfo.name, guildInfo.currency, "", ""]
      ];
      console.log(functionArgs);
      const iface = new ethers.utils.Interface(guildAppAbi);
      const calldata = iface.encodeFunctionData("initialize", functionArgs);
      console.log(network);

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
