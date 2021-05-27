import React, { useEffect, useState, useContext } from "react";

export type GuildMetadata = {
  name: string;
  description: string;
  contentFormat: string;
  externalLink: string;
  image: string;
  contributions: string;
};

const initialGuildMetadata = {
  name: "",
  description: "",
  contentFormat: "",
  externalLink: "",
  image: "",
  contributions: "ETH",
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

  // TODO: Placeholder values
  useEffect(() => {
    //setGuildMetadata({
    //  name: "Other internet",
    //  description:
    //    "Other internet is an independent strategy and research group. Our process is different. We research, prototype, and execute new models for thinking about culture and technology. In doing so we've become responsible for the narrative ducts driving software, money, knowledge, media and culture.",
    //  contentFormat: "Early access to research essays and Discord community.",
    //  externalLink: "https://otherinter.net",
    //  image: "",
    //  contributions: "ETH",
    //});
  }, []);
  return (
    <GuildContext.Provider value={{ guildMetadata, setGuildMetadata }}>
      {children}
    </GuildContext.Provider>
  );
};
