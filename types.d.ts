import {
  ChatInputCommandInteraction,
  SlashCommandSubcommandsOnlyBuilder,
  SlashCommandOptionsOnlyBuilder,
  AutocompleteInteraction,
  ModalSubmitInteraction,
  CacheType,
  Collection,
} from "discord.js";
import { SeatRoleApplier } from "./classes/seat/SeatRoleApplier";
import { DatabaseHandler } from "./classes/DatabaseHandler";

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
    seatRoleApplier?: SeatRoleApplier;
    databaseHandler?: DatabaseHandler;
    allowedGuildIds?: string[];
    ignoredGuildIds?: string[];
  }
}
