import axios from 'axios';

export class EsiRequester {
	private PostHeaders: object;
	private GetHeaders: object;

	constructor() {
		this.PostHeaders = {
			accept: 'application/json',
			'Content-Type': 'application/json',
			'Cache-Control': 'no-cache',
		};
		this.GetHeaders = {
			accept: 'application/json',
			'Cache-Control': 'no-cache',
		};
	}

	async getIdsFromNames(nameArray: string[]) {
		const url = 'https://esi.evetech.net/latest/universe/ids/?datasource=tranquility&language=en';
		const headers = { ...this.PostHeaders, 'accept-language': 'en' };

		const response = await axios.post(url, nameArray, { headers });
		return response.data as APIgetIdsFromNamesResponse;
	}

	async getNamesFromIds(idArray: number[]) {
		const url = 'https://esi.evetech.net/latest/universe/names/?datasource=tranquility&language=en';

		const response = await axios.post(url, idArray, { headers: this.PostHeaders });
		return response.data as APIgetNamesFromIdsObject[];
	}

	async getCorpHistoryFromCharId(characterId: string) {
		const response = await axios.get(`https://esi.evetech.net/latest/characters/${characterId}/corporationhistory/?datasource=tranquility`, { headers: this.GetHeaders });

		return response.data as APIcorpHistoryObject[];
	}
};

interface APIgetIdsFromNamesResponse {
    characters?: APIcharacterObject[],
}

interface APIcharacterObject {
	id: number,
	name: string,
}

interface APIcorpHistoryObject {
	corporation_id: number,
	record_id: number,
	start_date: string,
}

interface APIgetNamesFromIdsObject {
	category: 'corporation'
	id: number
	name: string
}