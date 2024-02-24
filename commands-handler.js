const { REST, Routes, Collection } = require('discord.js');
const { loadEnvironmentVariables } = require('./functions.js');
const fs = require('node:fs');
const path = require('node:path');

class commandsHandler {
	getCommands() {
		const commands = [];
		const outputCommands = new Collection();
		const commandsPath = path.join(__dirname, '../commands');

		const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

		const ignoreCommands = JSON.parse(process.env.IGNORE_COMMANDS).list;

		for (const file of commandFiles) {
			const command = require(`${commandsPath}/${file}`);

			if (ignoreCommands.includes(command.data.name)) {continue;}

			commands.push(command.data.toJSON());
			outputCommands.set(command.data.name, command);
		}

		return { outputCommands, commands };
	}

	async depolyCommands() {
		const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
		const { commands } = this.getCommands();

		try {
			console.log('Started deleting ALL application (/) commands.');

			const data = await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), { body: [] })
				.then(() => console.log('Successfully deleted all application commands.'))
				.then(() => {
					console.log(`Started deploying ${commands.length} application (/) commands.`);

					return rest.put(
						Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
						{ body: commands },
					);
				});

			console.log(`Successfully reloaded ${data.length} application (/) commands.`);
		}
		catch (error) {
			console.error(error);
		}
	}

	async executeCommands(interaction) {
		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
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

// 모듈로 사용될 경우
if (require.main !== module) {module.exports = commandsHandler;}
// 독립적으로 실행될 경우
else {
	loadEnvironmentVariables();

	const commandHandler = new commandsHandler();
	commandHandler.depolyCommands();
}