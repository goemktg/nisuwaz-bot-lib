import {
  ChatInputCommandInteraction,
  SlashCommandSubcommandsOnlyBuilder,
  SlashCommandOptionsOnlyBuilder,
  AutocompleteInteraction,
  ModalSubmitInteraction,
  CacheType,
  Collection,
} from "discord.js";
import { SeatRoleEngine } from "./classes/seat/SeatRoleEngine";
import { DatabaseEngine } from "./classes/DatabaseEngine";

export interface SlashCommand {
  command: SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => void;
  autocomplete?: (interaction: AutocompleteInteraction) => void;
  modal?: (interaction: ModalSubmitInteraction<CacheType>) => void;
  cooldown?: number;
}

declare module "discord.js" {
  export interface Client {
    commands: Collection<string, SlashCommand>;
    seatRoleEngine?: SeatRoleEngine;
    databaseEngine?: DatabaseEngine;
    allowedGuildIds?: string[];
    ignoredGuildIds?: string[];
  }
}
