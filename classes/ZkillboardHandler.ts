import axios from "axios";

export class ZkillboardRequester {
  private GetHeaders: object;
  constructor() {
    this.GetHeaders = {
      accept: "application/json",
      "User-Agent": "Maintainer: Goem Funaila(IG) samktg52@gmail.com",
      "Accept-Encoding": "gzip",
    };
  }
  static async getKillmailInfo(killmailID: string) {
    const response = await axios.get(
      `https://zkillboard.com/api/killID/${killmailID}/`,
    );

    const killmailDataArray = response.data as ZkillboardKillmailObject[];
    return killmailDataArray[0];
  }
}

export interface ZkillboardKillmailObject {
  killmail_id: number;
  zkb: {
    locationID: number;
    hash: string;
    fittedValue: number;
    droppedValue: number;
    destroyedValue: number;
    totalValue: number;
    points: number;
    npc: boolean;
    solo: boolean;
    awox: boolean;
    labels: string[];
  };
}
