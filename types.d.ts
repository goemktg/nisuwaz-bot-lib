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

export interface APIGetSeatUsersResponse {
    data: SeatUser[],
    links: {
        first: string,
        last: string,
        prev: string,
        next: string,
    },
    meta: {
        current_page: number,
        from: number,
        last_page: number,
        path: string,
        per_page: number,
        to: number,
        total: number,
    },
}

export interface SeatUser {
    id: number,
    name: string,
    email: string,
    active: boolean,
    last_login: string,
    last_login_source: string,
    associated_character_ids: string[],
    main_character_id: string,
}

declare module 'discord.js' {
    export interface Client {
        commands: Collection<string, SlashCommand>,
        seatRoleApllier: SeatRoleApplier,
    }
}