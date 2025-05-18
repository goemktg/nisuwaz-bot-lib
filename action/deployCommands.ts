import { REST } from "discord.js";
import { loadEnvironmentVariables, setDefaultLogLevel } from "../functions";
import { CommandsHandler } from "../classes/CommandHandler";
import { Command } from "commander";

loadEnvironmentVariables();
setDefaultLogLevel();

const program = new Command();

program
  .description("Deploy commands to Discord")
  .option("-r, --redeploy", "Redeploy commands")
  .option("-g, --guild <guildId>", "Deploy commands to a specific guild")
  .action((options) => {
    const { redeploy, guild } = options;
    if (redeploy && guild) {
      console.error("Redeploying commands to a specific guild is not supported.");
      process.exit(1);
    }

    if (!process.env.DISCORD_CLIENT_ID) {
      throw new Error("DISCORD_CLIENT_ID is not defined in .env file.");
    }
    if (!process.env.DISCORD_TOKEN) {
      throw new Error("DISCORD_TOKEN is not defined in .env file.");
    }
    if (redeploy) {
      console.log('🔁 Redeploying commands globally...');
      
      const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
      void CommandsHandler.redeployCommands(process.env.DISCORD_CLIENT_ID, rest);
    } else if (guild) {
      console.log(`🏠 Deploying commands to guildId: ${guild}`);
      
      const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
      void CommandsHandler.deployCommands(process.env.DISCORD_CLIENT_ID, rest, guild);
    } else {
      console.log('🔁 Deploying commands globally...');
      
      const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
      void CommandsHandler.deployCommands(process.env.DISCORD_CLIENT_ID, rest);
    }
  });

program.parse();