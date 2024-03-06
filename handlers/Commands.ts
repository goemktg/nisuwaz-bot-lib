import { REST, Routes, Collection, ChatInputCommandInteraction } from 'discord.js';
import { SlashCommand } from '../types';
import fs from 'node:fs';
import path from 'node:path';
import log from 'loglevel';

interface CommandFile {
	default: SlashCommand
}

export class CommandsHandler {
	async getCommandsFromDir() {
		let ignoreCommands: Array<string> = [];

		if (!process.env.DISCORD_IGNORED_COMMANDS) {
			log.warn('DISCORD_IGNORED_COMMANDS is not defined in .env file. Ignoring no commands.');
		}
		else {
			ignoreCommands = JSON.parse(process.env.DISCORD_IGNORED_COMMANDS) as Array<string>;
		}

		const commands : Collection<string, SlashCommand> = new Collection();

		const commandsDir = path.join(__dirname, '../../commands');
		const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

		for (const file of commandFiles) {
			// const commandFile = await import(`${commandsDir}/${file}`);
			const command: SlashCommand = (await import(`${commandsDir}/${file}`) as CommandFile).default;

			if (ignoreCommands.includes(command.command.name)) {continue;}

			commands.set(command.command.name, command);
		}

		return commands;
	}

	async depolyCommands() {
		if (!process.env.DISCORD_CLIENT_ID) {throw new Error('DISCORD_CLIENT_ID is not defined in .env file.');}
		if (!process.env.DISCORD_TOKEN) {throw new Error('DISCORD_TOKEN is not defined in .env file.');}

		const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
		const commands = await this.getCommandsFromDir();
		const clientId = process.env.DISCORD_CLIENT_ID;

		log.info('Started deleting ALL application (/) commands.');

		await rest.put(Routes.applicationCommands(clientId), { body: [] })
			.then(() => log.info('Successfully deleted all application commands.'))
			.then(async () => {
				log.info(`Started deploying ${commands.size} application (/) commands.`);

				await rest.put(Routes.applicationCommands(clientId),
					{ body: commands.map(command => command.command.toJSON()) },
				);
			})
			.then(() => log.info(`Successfully deployed ${commands.size} application (/) commands.`));
	}

	async executeCommand(interaction: ChatInputCommandInteraction) {
		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			command.execute(interaction);
		}
		catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			}
			else {
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}
	}
}