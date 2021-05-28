import { log } from "@graphprotocol/graph-ts";
import { NewGuild } from "../generated/GuildFactory/GuildFactory";
import { GuildAppTemplate } from "../generated/templates";


export function handleNewGuild(event: NewGuild): void {
    log.info("**** New Guild: {}, Owner: {}", [event.params.guild.toHexString(), event.params.guildOwner.toHexString()]);
    GuildAppTemplate.create(event.params.guild);
}