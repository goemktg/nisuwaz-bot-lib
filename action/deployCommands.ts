import { REST } from "discord.js";
import { loadEnvironmentVariables, setDefaultLogLevel } from "../functions";
import { CommandsHandler } from "../classes/CommandHandler";
import { Command } from "commander";

loadEnvironmentVariables();
setDefaultLogLevel();

const program = new Command();

program
  .description("Deploy commands to Discord")
  .option("-f, --force", "Force deploy commands")
  .option("-g, --guild <guildId>", "Deploy commands to a specific guild")
  .option("-r, --remove <guildId>", "Remove commands from a specific guild")
  .action(
    async (options: { force?: boolean; guild?: string; remove?: string }) => {
      const { force, guild, remove } = options;

      // 옵션 조합 검사
      if (force && (guild || remove)) {
        console.error(
          "Force option cannot be used with guild or remove options.",
        );
        process.exit(1);
      }
      if (guild && remove) {
        console.error("Guild and remove options cannot be used together.");
        process.exit(1);
      }

      if (!process.env.DISCORD_CLIENT_ID) {
        throw new Error("DISCORD_CLIENT_ID is not defined in .env file.");
      }
      if (!process.env.DISCORD_TOKEN) {
        throw new Error("DISCORD_TOKEN is not defined in .env file.");
      }

      const rest = new REST({ version: "10" }).setToken(
        process.env.DISCORD_TOKEN,
      );
      if (force) {
        console.log("🔁 Redeploying commands globally...");

        await CommandsHandler.removeCommands(
          process.env.DISCORD_CLIENT_ID,
          rest,
        );
        await CommandsHandler.deployCommands(
          process.env.DISCORD_CLIENT_ID,
          rest,
        );
      } else if (remove) {
        console.log(`🏠 Removing commands from guildId: ${remove}`);

        await CommandsHandler.removeCommands(
          process.env.DISCORD_CLIENT_ID,
          rest,
          remove,
        );
      } else if (guild) {
        console.log(`🏠 Deploying commands to guildId: ${guild}`);

        await CommandsHandler.deployCommands(
          process.env.DISCORD_CLIENT_ID,
          rest,
          guild,
        );
      } else {
        console.log("🌍 Deploying commands globally...");

        await CommandsHandler.deployCommands(
          process.env.DISCORD_CLIENT_ID,
          rest,
        );
      }
    },
  );

program.parse();
