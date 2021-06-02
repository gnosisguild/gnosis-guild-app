import { GuildMetadata } from "../context/GuildContext";

const GUILD_KEY = "GNOSIS_GUILD";

export const fetchGuildLocal = (): GuildMetadata => {
  const guild = localStorage.getItem(GUILD_KEY);
  let objGuild = {
    name: "",
    description: "",
    contentFormat: "",
    externalLink: "",
    image: "",
    currency: "ETH",
    amount: "0"
  };
  if (guild) {
    objGuild = JSON.parse(guild);
  }
  return objGuild;
};

export const storeGuildLocal = (guild: GuildMetadata) => {
  localStorage.setItem(GUILD_KEY, JSON.stringify(guild));
};

export const deleteGuildLocal = () => {
  localStorage.removeItem(GUILD_KEY);
};
