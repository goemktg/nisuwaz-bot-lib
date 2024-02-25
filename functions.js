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

async function getAuditTargetNickname(auditLog, client) {
	const user = await client.users.fetch(auditLog.targetId);
	const member = await client.guilds.cache.get('337276039858356224').members.fetch(user.id);
	const nickname = member.nickname;

	return nickname;
}

// Export the function
module.exports = { loadEnvironmentVariables, getAuditTargetNickname };