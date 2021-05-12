import React, { useEffect, useState, useContext } from "react";

export const GuildContext = React.createContext({});

export const useGuildContext = () => useContext(GuildContext);

export const GuildProvider: React.FC = ({ children }) => {
  const [guildMetadata, setGuildMetadata] = useState({
    name: "",
    description: "",
    contentFormat: "",
    externalLink: "",
    image: "",
    contributions: "",
  });

  // TODO: Placeholder values
  useEffect(() => {
    setGuildMetadata({
      name: "Other internet",
      description:
        "Other internet is an independent strategy and research group. Our process is different. We research, prototype, and execute new models for thinking about culture and technology. In doing so we've become responsible for the narrative ducts driving software, money, knowledge, media and culture.",
      contentFormat: "Early access to research essays and Discord community.",
      externalLink: "https://otherinter.net",
      image: "",
      contributions: "ETH",
    });
  }, []);
  return (
    <GuildContext.Provider value={{ guildMetadata }}>
      {children}
    </GuildContext.Provider>
  );
};
