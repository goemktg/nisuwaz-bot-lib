import axios from 'axios';
import log from 'loglevel';

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
	async addUserRole(seatUserId: string, seatReoleId: string) {
		log.info(`removing role ${seatUserId} from user ${seatReoleId}`);

		await axios.delete(`https://seat.nisuwaz.com/api/v2/roles/members/${seatUserId}/${seatReoleId}`, { headers: this.DeleteHeaders });
	}

	/**
	 * seatUserId에 해당하는 유저에게 seatReoleId 롤을 부여합니다.
	 * @param {string} seatUserId
	 * @param {string} seatReoleId
	 */
	async removeUserRole(seatUserId: string, seatReoleId: string) {
		log.info(`adding role ${seatUserId} to user ${seatReoleId}`);

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
	async getUsers(page: number = 1): Promise<APIGetSeatUsersResponse> {
		const response = await axios.get(`https://seat.nisuwaz.com/api/v2/users?page=${page}`, { headers: this.GetHeaders });

		return await response.data as APIGetSeatUsersResponse;
	}

	/**
	 * characterId에 해당하는 캐릭터의 시트를 가져옵니다.
	 * @param {string} characterId
	 * @returns {Promise<APIGetSeatCharacterSheetResponse>}
	 */
	async getCharacterSheetFromId(characterId: string): Promise<APIGetSeatCharacterSheetResponse> {
		const response = await axios.get(`https://seat.nisuwaz.com/api/v2/character/sheet/${characterId}`, { headers: this.GetHeaders });

		return await response.data as APIGetSeatCharacterSheetResponse;
	}
};

export interface APIGetSeatUsersResponse {
    data: SeatUser[],
    links: {
        first: string,
        last: string,
        prev: string,
        next: string,
    },
    meta: {
        current_page: number,
        from: number,
        last_page: number,
        path: string,
        per_page: number,
        to: number,
        total: number,
    },
}

export interface SeatUser {
    id: number,
    name: string,
    email: string,
    active: boolean,
    last_login: string,
    last_login_source: string,
    associated_character_ids: string[],
    main_character_id: string,
}

interface APIGetSeatCharacterSheetResponse {
	name: string,
	description: string,
	corporation?: {
		entity_id: number,
		name: string,
		category: 'corporation',
	},
	alliance?: {
		entity_id: number,
		name: string,
		category: 'alliance',
	},
	faction: {
		entity_id: null,
		name: string,
		category: 'faction',
	},
	birthday: string,
	gender: string,
	race_id: number,
	bloodline_id: number,
	security_status: number,
	balance: number,
	skillpoints: {
		total_sp: number,
		unallocated_sp: number,
	},
	user_id: number,
}