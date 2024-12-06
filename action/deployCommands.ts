import { REST } from "discord.js";
import { loadEnvironmentVariables, setDefaultLogLevel } from "../functions";
import { CommandsHandler } from "../classes/CommandHandler";

loadEnvironmentVariables();
setDefaultLogLevel();

const commandsHandler = new CommandsHandler();
if (!process.env.DISCORD_CLIENT_ID) {
  throw new Error("DISCORD_CLIENT_ID is not defined in .env file.");
}
if (!process.env.DISCORD_TOKEN) {
  throw new Error("DISCORD_TOKEN is not defined in .env file.");
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
void commandsHandler.deployCommands(process.env.DISCORD_CLIENT_ID, rest);
