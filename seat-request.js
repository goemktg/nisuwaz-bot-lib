const axios = require('axios');

module.exports = class SeatRequest {
	constructor() {
		this.DeleteHeaders = {
			accept: '*/*',
			'X-TOKEN': process.env.SEAT_TOKEN,
		};
		this.PostHeaders = {
			accept: '*/*',
			'Content-Type': 'application/json',
			'X-TOKEN': process.env.SEAT_TOKEN,
		};
		this.GetHeaders = {
			accept: 'application/json',
			'X-TOKEN': process.env.SEAT_TOKEN,
		};
	}

	async userRoleRemove(userId, roleId) {
		console.log(`removing role ${roleId} from user ${userId}`);

		await axios.delete(`https://seat.nisuwaz.com/api/v2/roles/members/${userId}/${roleId}`, { headers: this.DeleteHeaders });
	}

	async userRoleAdd(userId, roleId) {
		console.log(`adding role ${roleId} to user ${userId}`);

		const url = 'https://seat.nisuwaz.com/api/v2/roles/members';
		const data = {
			user_id: userId,
			role_id: roleId,
		};

		await axios.post(url, data, { headers: this.PostHeaders });
	}

	async getSeatUsers(page = 1) {
		const response = await axios.get(`https://seat.nisuwaz.com/api/v2/users?page=${page}`, { headers: this.GetHeaders });
		return await response.data;
	}
};