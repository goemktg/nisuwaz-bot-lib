const axios = require('axios');

module.exports = class EsiRequest {
	constructor() {
		this.PostHeaders = {
			accept: 'application/json',
			'Content-Type': 'application/json',
			'Cache-Control': 'no-cache',
		};
	}

	async getIdFromName(nameArray) {
		const url = 'https://esi.evetech.net/latest/universe/ids/?datasource=tranquility&language=en';
		const headers = { ...this.PostHeaders, 'accept-language': 'en' };

		const response = await axios.post(url, nameArray, { headers });
		return response.data;
	}
};