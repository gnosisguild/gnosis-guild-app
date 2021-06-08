import React, { useEffect, useState, useContext } from "react";

import { useGuild } from "../hooks/useGuild";
import { useWeb3Context } from "../context/Web3Context";
import { IPFS_GATEWAY } from "../constants";

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
  imageCid: ""
};

export type GuildContextValue = {
  guildMetadata: GuildMetadata;
  setGuildMetadata: (arg0: GuildMetadata) => void;
};
export const GuildContext = React.createContext<GuildContextValue>({
  guildMetadata: initialGuildMetadata,
  setGuildMetadata: guildMeta => {}
});

export const useGuildContext = () => useContext(GuildContext);

export const GuildProvider: React.FC = ({ children }) => {
  const [guildMetadata, setGuildMetadata] = useState(initialGuildMetadata);
  const { fetchGuildByAddress, fetchMetadata } = useGuild();
  const { providerChainId, account } = useWeb3Context();

  // TODO: Placeholder values
  useEffect(() => {
    const initialGuild = async () => {
      const guilds = await fetchGuildByAddress(account, providerChainId);
      // Also fetch metadata
      if (guilds && guilds.length > 0) {
        const guild = guilds[0];
        let metadata = {
          ...guildMetadata
        };
        if (guild.metadataURI) {
          metadata = await fetchMetadata(guild.metadataURI, guild.id);
        }
        let blob = new Blob();
        if (metadata.imageCid) {
          let resp = await fetch(
            `${IPFS_GATEWAY}/${metadata.imageCid}`
          ).catch((err: Error) =>
            console.error("Failed to fetch metadata image")
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
          imageCid: metadata.imageCid
        });
      }
    };
    initialGuild();
  }, [account, providerChainId]);
  return (
    <GuildContext.Provider value={{ guildMetadata, setGuildMetadata }}>
      {children}
    </GuildContext.Provider>
  );
};
