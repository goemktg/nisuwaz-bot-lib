import { GuildAuditLogsEntry, Guild, Client, ActivityType, ClientUser, TextChannel, MessageCreateOptions } from 'discord.js';
import log, { LogLevelDesc } from 'loglevel';

/**
 * .env 파일 또는 Docker 환경 변수에서 환경 변수를 로드합니다.
 */
export function loadEnvironmentVariables() {
	try {
		require('./loadEnvironmentVariables');
	}
	catch (ex) {
		log.warn('.env not found. using docker environment variable');
	}
}

/**
 * auditlog 대상의 닉네임을 가져옵니다.
 * @param {GuildAuditLogsEntry} auditLog
 * @param {Guild} guild
 * @returns {Promise<string>}
 */
export async function getAuditTargetNickname(auditLog: GuildAuditLogsEntry, guild: Guild): Promise<string> {
	if (!auditLog.targetId) {
		throw new Error('auditLog.targetId is not defined.');
	}

	const user = await guild.client.users.fetch(auditLog.targetId);
	const member = await guild.members.fetch(user.id);

	if (!member.nickname) {
		throw new Error('member.nickname is not defined.');
	}

	return member.nickname;
}

interface DiscordRole {
    id: string,
    name: string,
}

/**
 * auditLogsEntry 에서의 뉴비 롤 권한 변경을 반영합니다.
 *
 * @param {GuildAuditLogsEntry} auditLog - 길드 auditLogsEntry.
 * @param {string} nickname - 유저의 닉네임.
 * @param {(a: string) => void} addFunction - 롤 추가시 호출할 함수.
 * @param {(a: string) => void} removeFunction - 롤 제거시 호출할 함수.
 */
export function reflectNewbieRoleChange(auditLog: GuildAuditLogsEntry, nickname: string, addFunction: (a: string) => void, removeFunction: (a: string) => void) {
	for (const change of auditLog.changes) {
		for (const newRole of (change.new as DiscordRole[])) {
			if (!getNewbieRoleIds().includes(newRole.id)) continue;

			if (change.key === '$add') {addFunction(nickname);}
			else if (change.key === '$remove') {removeFunction(nickname);}
		}
	}
}

/**
 * 뉴비 롤의 ID를 가져옵니다.
 *
 * @returns {string[]}
 */
export function getNewbieRoleIds(): string[] {
	if (!process.env.DISCORD_NEWBIE_ROLE_IDS) {
		throw new Error('DISCORD_NEWBIE_ROLE_IDS is not defined in environment variables.');
	}

	return JSON.parse(process.env.DISCORD_NEWBIE_ROLE_IDS) as string[];
}

/**
 * 디스코드 상태를 설정합니다.
 */
export function setDiscordPresence(client: Client, state: string) {
	(client.user as ClientUser).setPresence({
		activities: [{
			type: ActivityType.Custom,
			name: 'custom',
			state: state,
		}],
	});
}

/**
 * 공지 채널 메시지가 같은지 확인하고 다르면 새로운 메시지를 보냅니다.
 *
 * @param {TextChannel} channel - 공지 채널
 * @param {MessageCreateOptions} msg - 메시지 내용
 */
export async function sendAnnouncementMsg(channel: TextChannel, msg: MessageCreateOptions) {
	log.info(`Checking notice channel... in guild: ${channel.guild.name} (${channel.guild.id})`);
	const messages = await channel.messages.fetch();
	if (messages.size === 0) return;

	if (!(messages.first()?.content.trim() === msg.content?.trim()) || !(JSON.stringify(messages.first()?.components) === JSON.stringify(msg.components))) {
		log.info('Message is not same. Deleting old message and sending new message...');
		await messages.first()?.delete();
		await channel.send(msg);
	}
}

/**
 * 로그 레벨을 설정합니다
 */
export function setDefaultLogLevel() {
	log.setDefaultLevel(process.env.LOG_LEVEL as LogLevelDesc || 'INFO');
}