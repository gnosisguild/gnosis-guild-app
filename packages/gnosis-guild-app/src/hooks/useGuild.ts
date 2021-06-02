import { useCallback } from "react";
import { request, gql } from "graphql-request";
import { getNetworkByChainId } from "../lib/networks";
import { storeGuildLocal, deleteGuildLocal } from "../lib/localStorage";
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

  const createGuild = async (
    chainId: number,
    ethersProvider: ethers.providers.Web3Provider,
    guildInfo: GuildMetadata,
    creatorAddress: string
  ): Promise<void> => {
    const network = getNetworkByChainId(chainId);

    // Fetch count to get ID
    const factoryAbi = [
      "function createGuild(bytes calldata _initData) public ",
      "function totalGuilds() public view returns (uint256)"
    ];
    const factoryContract = new Contract(
      network.guildFactory,
      factoryAbi,
      ethersProvider.getSigner()
    );

    const count = await factoryContract
      .totalGuilds()
      .catch((err: Error) =>
        console.error(`Failed to fetch total guilds ${err}`)
      );

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
      [guildInfo.name, `GUILD${count}`, "", ""]
    ];
    const iface = new ethers.utils.Interface(guildAppAbi);
    const calldata = iface.encodeFunctionData("initialize", functionArgs);

    factoryContract
      .createGuild(calldata)
      .catch((err: Error) => console.error(`Failed to create guild: ${err}`));
    storeGuildLocal(guildInfo);
  };

  const deactivateGuild = async (
    chainId: number,
    ethersProvider: ethers.providers.Web3Provider,
    ownerAddress: string
  ): Promise<void> => {
    const network = getNetworkByChainId(chainId);
    const abi = [
      "function guildsOf(address _owner) public view returns (address[] memory)"
    ];
    // get guilds
    const guildAppContract = new Contract(
      network.guildFactory,
      abi,
      ethersProvider.getSigner()
    );
    const guilds = await guildAppContract
      .guildsOf(ownerAddress)
      .catch((err: Error) => console.error(`Failed to create guild: ${err}`));

    // Select the first
    console.log("Guilds");
    console.log(guilds);
    // Call pause
    const guildAddress = guilds[0];
    const abiApp = ["function pauseGuild(bool pause) external"];
    const guildContract = new Contract(
      guildAddress,
      abiApp,
      ethersProvider.getSigner()
    );
    deleteGuildLocal();
    // guildContract
    //   .pauseGuild(true)
    //   .catch((err: Error) => console.error(`Failed to pause ${err}`));
  };

  return { fetchGuildByAddress, createGuild, deactivateGuild };
};
