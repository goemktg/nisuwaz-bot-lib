import { GuildAuditLogsEntry, Guild } from 'discord.js';
import { DiscordRole } from './types';

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

/**
 * auditLogsEntry 에서의 뉴비 롤 권한 변경을 반영합니다.
 *
 * @param {GuildAuditLogsEntry} auditLog - 길드 auditLogsEntry.
 * @param {string} nickname - 유저의 닉네임.
 * @param {(a: string) => void} addFunction - 롤 추가시 호출할 함수.
 * @param {(a: string) => void} removeFunction - 롤 제거시 호출할 함수.
 */
export function reflectNewbieRoleChange(auditLog: GuildAuditLogsEntry, nickname: string, addFunction: (a: string) => void, removeFunction: (a: string) => void) {
	const watchRoleIds = ['1210191232756621383', '1210112780141600818'];

	for (const change of auditLog.changes) {
		for (const newRole of (change.new as DiscordRole[])) {
			if (!watchRoleIds.includes(newRole.id)) continue;

			if (change.key === '$add') {addFunction(nickname);}
			else if (change.key === '$remove') {removeFunction(nickname);}
		}
	}
}