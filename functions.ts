import { GuildAuditLogsEntry, Guild } from 'discord.js';

/**
 * .env 파일 또는 Docker 환경 변수에서 환경 변수를 로드합니다.
 */
export function loadEnvironmentVariables() {
	try {
		require('./loadEnvironmentVariables');
	}
	catch (ex) {
		console.log('.env not found. using docker environment variable');
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