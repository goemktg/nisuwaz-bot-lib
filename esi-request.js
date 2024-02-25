const axios = require('axios');

module.exports = class EsiRequest {
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

	async getIdsFromNames(nameArray) {
		const url = 'https://esi.evetech.net/latest/universe/ids/?datasource=tranquility&language=en';
		const headers = { ...this.PostHeaders, 'accept-language': 'en' };

		const response = await axios.post(url, nameArray, { headers });
		return response.data;
	}

	async getNamesFromIds(idArray) {
		const url = 'https://esi.evetech.net/latest/universe/names/?datasource=tranquility&language=en';

		const response = await axios.post(url, idArray, { headers: this.PostHeaders });
		return response.data;
	}

	async getCorpHistory(characterId) {
		const response = await axios.get(`https://esi.evetech.net/latest/characters/${characterId}/corporationhistory/?datasource=tranquility`, { headers: this.GetHeaders });

		return response.data;
	}
};