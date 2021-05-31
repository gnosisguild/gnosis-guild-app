import React, { useEffect, useState, useContext } from "react";

import { useWeb3Context } from "./Web3Context";

import { fetchGuildByAddress } from "../lib/graphql";

export type GuildMetadata = {
  name: string;
  description: string;
  contentFormat: string;
  externalLink: string;
  image: string;
  currency: string;
  amount: number;
};

const initialGuildMetadata = {
  name: "",
  description: "",
  contentFormat: "",
  externalLink: "",
  image: "",
  currency: "ETH",
  amount: 0,
};

export type GuildContextValue = {
  guildMetadata: GuildMetadata;
  setGuildMetadata: (arg0: GuildMetadata) => void;
};
export const GuildContext = React.createContext<GuildContextValue>({
  guildMetadata: initialGuildMetadata,
  setGuildMetadata: (guildMeta) => {},
});

export const useGuildContext = () => useContext(GuildContext);

export const GuildProvider: React.FC = ({ children }) => {
  const [guildMetadata, setGuildMetadata] = useState(initialGuildMetadata);
  // Check if guild exists
  // If guild exists then display
  // if guild does not exist nothing to display

  // TODO: Might be better to    store provider as a item in local storage
  const { ethersProvider } = useWeb3Context();

  // TODO: Placeholder values
  useEffect(() => {
    // setGuildMetadata({
    //   name: "Other internet",
    //   description:
    //     "Other internet is an independent strategy and research group. Our process is different. We research, prototype, and execute new models for thinking about culture and technology. In doing so we've become responsible for the narrative ducts driving software, money, knowledge, media and culture.",
    //   contentFormat: "Early access to research essays and Discord community.",
    //   externalLink: "https://otherinter.net",
    //   image: "",
    //   contributions: "ETH",
    // });
    console.log("");
    console.log(ethersProvider);
    const fetchGuild: any = async () => {
      const resp = await fetchGuildByAddress("", "");
      return resp;
    };
    fetchGuild();
  }, []);
  return (
    <GuildContext.Provider value={{ guildMetadata, setGuildMetadata }}>
      {children}
    </GuildContext.Provider>
  );
};
