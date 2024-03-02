import { ChatInputCommandInteraction, AutocompleteInteraction, ModalSubmitInteraction, SlashCommandBuilder, CacheType, Collection } from 'discord.js';
import { SeatRoleApplier } from '../SeatRoleApplier';

export interface SlashCommand {
    command: SlashCommandBuilder,
    execute: (interaction : ChatInputCommandInteraction) => void,
    autocomplete?: (interaction: AutocompleteInteraction) => void,
    modal?: (interaction: ModalSubmitInteraction<CacheType>) => void,
    cooldown?: number,
}

export interface DiscordRole {
    id: string,
    name: string,
}

declare module 'discord.js' {
    export interface Client {
        commands: Collection<string, SlashCommand>,
        seatRoleApllier: SeatRoleApplier,
    }
}