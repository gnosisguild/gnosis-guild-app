import { NewGuild } from "../generated/GuildFactory/GuildFactory";
// import { Guild } from "../generated/schema";
import { GuildAppTemplate } from "../generated/templates";


export function handleNewGuild(event: NewGuild): void {
    GuildAppTemplate.create(event.params.guild);

    // let guildId = event.params.guild.toHexString();
    // let guild = new Guild(guildId);
    // guild.createdAt = event.block.timestamp.toString();
    // guild.owner = event.params.guildOwner;
    // guild.name = "";
    // guild.symbol = "";
    // guild.metadataURI = "";
    // guild.active = true;
    // guild.tokenAddress = "";
    // guild.currentBalance = 0;
    // guild.totalSubscriptions = 0;
    // guild.subsPeriod = "";
    // guild.currentPrice = "";
    
    // guild.save();
}