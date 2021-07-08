import React, { useEffect, useState, useContext } from "react";

import { useGuild } from "../hooks/useGuild";
import { useWeb3Context } from "./Web3Context";
import { IPFS_GATEWAY } from "../constants";
import { fetchGuildByAddress } from "../graphql";

export type GuildMetadata = {
  name: string;
  description: string;
  contentFormat: string;
  externalLink: string;
  image: File;
  currency: string;
  amount: string;
  guildAddress: string;
  imageCid: string;
  tokenAddress?: string;
  active: boolean;
};

const initialGuildMetadata = {
  name: "",
  description: "",
  contentFormat: "",
  externalLink: "",
  image: new File([], ""),
  currency: "ETH",
  amount: "0",
  guildAddress: "",
  imageCid: "",
  active: false,
};

export type GuildContextValue = {
  loading: boolean;
  refreshGuild: () => void;
  guildMetadata: GuildMetadata;
  setGuildMetadata: (arg0: GuildMetadata) => void;
};
export const GuildContext = React.createContext<GuildContextValue>({
  loading: false,
  refreshGuild: async () => {},
  guildMetadata: initialGuildMetadata,
  setGuildMetadata: (guildMeta) => {
    guildMeta;
  },
});

export const useGuildContext = () => useContext(GuildContext);

export const GuildProvider: React.FC = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [guildMetadata, setGuildMetadata] = useState(initialGuildMetadata);
  const { fetchMetadata } = useGuild();
  const { providerChainId, account } = useWeb3Context();

  const refreshGuild = async () => {
    if (account) {
      setLoading(true);
      const guilds = await fetchGuildByAddress(account, providerChainId);
      // Also fetch metadata
      if (guilds && guilds.length > 0) {
        const guild = guilds[guilds.length - 1];
        let metadata = {
          name: guildMetadata.name,
          description: guildMetadata.description,
          contentFormat: guildMetadata.contentFormat,
          externalLink: guildMetadata.externalLink,
          image: guildMetadata.image,
          currency: guildMetadata.currency,
          amount: guildMetadata.amount,
          guildAddress: guildMetadata.guildAddress,
          imageCid: guildMetadata.imageCid,
        };
        if (guild.metadataURI) {
          const cid = guild.metadataURI.split("/").slice(-1)[0];
          metadata = await fetchMetadata(`${IPFS_GATEWAY}/${cid}`, guild.id);
        }
        let blob = new Blob();
        if (metadata.imageCid) {
          const resp = await fetch(
            `${IPFS_GATEWAY}/${metadata.imageCid}`
          ).catch((err: Error) =>
            console.error(`Failed to fetch metadata image ${err}`)
          );
          if (resp) {
            blob = await resp.blob();
          }
        }
        setGuildMetadata({
          name: guild.name,
          description: metadata.description,
          contentFormat: metadata.contentFormat,
          externalLink: metadata.externalLink,
          image: new File([blob], "profile.jpg"),
          currency: metadata.currency,
          amount: metadata.amount,
          guildAddress: metadata.guildAddress,
          imageCid: metadata.imageCid,
          active: guild.active,
        });
      }
      setLoading(false);
    }
  };

  // TODO: Placeholder values
  useEffect(() => {
    refreshGuild();
  }, [account, providerChainId]);

  return (
    <GuildContext.Provider
      value={{ loading, refreshGuild, guildMetadata, setGuildMetadata }}
    >
      {children}
    </GuildContext.Provider>
  );
};
