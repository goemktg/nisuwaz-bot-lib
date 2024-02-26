/**
 * .env 파일 또는 Docker 환경 변수에서 환경 변수를 로드합니다.
 */
function loadEnvironmentVariables() {
	try {
		const dotenv = require('dotenv');
		dotenv.config();
	}
	catch (ex) {
		console.log('.env not found. using docker environment variable');
	}
}

async function getAuditTargetNickname(auditLog, guild) {
	const user = await guild.client.users.fetch(auditLog.targetId);
	const member = await guild.members.fetch(user.id);

	return member.nickname;
}

module.exports = { loadEnvironmentVariables, getAuditTargetNickname };