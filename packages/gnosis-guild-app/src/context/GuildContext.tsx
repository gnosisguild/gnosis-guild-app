import React, { useEffect, useState, useContext } from "react";

import { fetchGuildLocal } from "../lib/localStorage";
import { useWeb3Context } from "./Web3Context";

export type GuildMetadata = {
  name: string;
  description: string;
  contentFormat: string;
  externalLink: string;
  image: string;
  currency: string;
  amount: string;
};

const initialGuildMetadata = {
  name: "",
  description: "",
  contentFormat: "",
  externalLink: "",
  image: "",
  currency: "ETH",
  amount: "0"
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

  // TODO: Placeholder values
  useEffect(() => {
    const guild = fetchGuildLocal();
    console.log("Guild Meta");
    console.log(guild);
    setGuildMetadata(guild);
  }, []);
  return (
    <GuildContext.Provider value={{ guildMetadata, setGuildMetadata }}>
      {children}
    </GuildContext.Provider>
  );
};
