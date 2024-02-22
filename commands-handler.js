const { REST, Routes, Collection } = require('discord.js');
const { loadEnvironmentVariables } = require('./functions.js');
const fs = require('node:fs');
const path = require('node:path');

// 모듈로 사용될 경우
if (require.main !== module) {module.exports = handleCommands;}
// 독립적으로 실행될 경우
else {handleCommands('deploy');}

async function handleCommands(type) {
	// deploy 시 env 불러옴
	if (type === 'deploy') {loadEnvironmentVariables();}

	const commands = [];
	const outputCommands = new Collection();
	const commandsPath = path.join(__dirname, '../commands');
	// commands 풀더에 위치한 모든 .js 파일을 불러옴
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	// 배포 전에 배포 무시할 명령어들을 가져옴
	const ignoreCommands = JSON.parse(process.env.IGNORE_COMMANDS).list;

	// 배포를 위해 모든 명령어 각각의 SlashCommandBuilder#toJSON() 데이터 결과를 가져옴
	for (const file of commandFiles) {
		const command = require(`${commandsPath}/${file}`);

		// 무시할 명령어 목록에 해당 명령아가 있으면 스킵
		if (ignoreCommands.includes(command.data.name)) {continue;}

		commands.push(command.data.toJSON());

		outputCommands.set(command.data.name, command);
	}
	// REST 모듈 instance 생성 및 준비
	const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

	// init 모드일시 배포하지 않고 명령어 목록 리턴함
	if (type === 'init') {return outputCommands;}

	// 명령어 배포
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