import axios from 'axios';
import { APIGetSeatUsersResponse } from '../types';

export class SeatRequester {
	private DeleteHeaders: object;
	private PostHeaders: object;
	private GetHeaders: object;

	constructor() {
		if (process.env.SEAT_TOKEN === undefined) throw new Error('SEAT_TOKEN is not defined in .env file.');

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

	/**
	 * seatUserId에 해당하는 유저에게 seatReoleId 롤을 제거합니다.
	 * @param {string} seatUserId
	 * @param {string} seatReoleId
	 */
	async userRoleRemove(seatUserId: string, seatReoleId: string) {
		console.log(`removing role ${seatUserId} from user ${seatReoleId}`);

		await axios.delete(`https://seat.nisuwaz.com/api/v2/roles/members/${seatUserId}/${seatReoleId}`, { headers: this.DeleteHeaders });
	}

	/**
	 * seatUserId에 해당하는 유저에게 seatReoleId 롤을 부여합니다.
	 * @param {string} seatUserId
	 * @param {string} seatReoleId
	 */
	async userRoleAdd(seatUserId: string, seatReoleId: string) {
		console.log(`adding role ${seatUserId} to user ${seatReoleId}`);

		const url = 'https://seat.nisuwaz.com/api/v2/roles/members';
		const data = {
			user_id: seatUserId,
			role_id: seatReoleId,
		};

		await axios.post(url, data, { headers: this.PostHeaders });
	}


	/**
	 * page에 해당하는 seat 유저들을 가져옵니다.
	 * @param {number} page
	 * @returns {Promise<APIGetSeatUsersResponse>}
	 */
	async getSeatUsers(page: number = 1): Promise<APIGetSeatUsersResponse> {
		const response = await axios.get(`https://seat.nisuwaz.com/api/v2/users?page=${page}`, { headers: this.GetHeaders });

		return await response.data as APIGetSeatUsersResponse;
	}
};