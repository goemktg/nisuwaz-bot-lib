import {
  REST,
  Routes,
  Collection,
  ChatInputCommandInteraction,
} from "discord.js";
import { SlashCommand } from "../types";
import fs from "node:fs";
import path from "node:path";
import log from "loglevel";

interface CommandFile {
  default: SlashCommand;
}

export class CommandsHandler {
  async getCommandsFromDir() {
    let ignoreCommands: string[] = [];

    if (!process.env.DISCORD_IGNORED_COMMANDS) {
      log.warn(
        "DISCORD_IGNORED_COMMANDS is not defined in .env file. Ignoring no commands.",
      );
    } else {
      ignoreCommands = JSON.parse(
        process.env.DISCORD_IGNORED_COMMANDS,
      ) as string[];
    }

    const commands = new Collection<string, SlashCommand>();

    const commandsDir = path.join(__dirname, "../../commands");
    const commandFiles = fs
      .readdirSync(commandsDir)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

    for (const file of commandFiles) {
      // const commandFile = await import(`${commandsDir}/${file}`);
      const command: SlashCommand = (
        (await import(`${commandsDir}/${file}`)) as CommandFile
      ).default;

      if (ignoreCommands.includes(command.command.name)) {
        continue;
      }

      commands.set(command.command.name, command);
    }

    log.info(`Loaded ${commands.size} application (/) commands.`);

    return commands;
  }

  async deployCommands(discordClientID: string, rest: REST) {
    const commands = await this.getCommandsFromDir();
    const clientId = discordClientID;

    try {
      await rest.put(Routes.applicationCommands(clientId), {
        body: commands.map((command) => command.command.toJSON()),
      });
      log.info(
        `Successfully deployed ${commands.size} application (/) commands.`,
      );
    } catch (error) {
      log.error("Failed to deploy commands:", error);
    }
  }

  async redeployCommands(discordClientID: string, rest: REST) {
    log.info("Started deleting ALL application (/) commands.");

    try {
      await rest.put(Routes.applicationCommands(discordClientID), { body: [] });
      log.info("Successfully deleted all application commands.");

      await this.deployCommands(discordClientID, rest);
    } catch (error) {
      log.error("Failed to redeploy commands:", error);
    }
  }

  async executeCommand(interaction: ChatInputCommandInteraction) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`,
      );
      return;
    }

    try {
      command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    }
  }
}
