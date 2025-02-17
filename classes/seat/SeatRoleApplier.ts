import { SeatHanlder } from "./SeatHandler";

export class SeatRoleApplier {
  private seatHanler: SeatHanlder = new SeatHanlder();
  private seatUsersCache = new Map<string, SeatUser>();

  /**
   * mainCharacterName에 해당하는 seatUserId를 가져옵니다.
   * @param {string} mainCharacterName
   * @returns {Promise<string>}
   */
  async getSeatUserId(mainCharacterName: string): Promise<string> {
    let user = this.seatUsersCache.get(mainCharacterName);
    let seatUserIndex = 1;

    while (user === undefined) {
      const seatUsers = await this.seatHanler.getUsers(seatUserIndex);

      for (const seatUser of seatUsers.data) {
        this.seatUsersCache.set(seatUser.name, seatUser);

        if (seatUser.name === mainCharacterName) {
          user = seatUser;
        }
      }

      seatUserIndex++;
    }

    return user.id.toString();
  }

  /**
   * seatUserId에 해당하는 유저에게 뉴비 롤을 부여합니다.
   * @param {string} mainCharacterName
   * @param {string} roleId
   */
  async add(mainCharacterName: string, roleId: string) {
    const seatUserId = await this.getSeatUserId(mainCharacterName);
    await this.seatHanler.addUserRole(seatUserId, roleId);
  }

  /**
   * seatUserId에 해당하는 유저에게 roleId에 해당하는 롤을 제거합니다.
   * @param {string} mainCharacterName
   * @param {string} roleId
   */
  async remove(mainCharacterName: string, roleId: string) {
    const seatUserId = await this.getSeatUserId(mainCharacterName);
    await this.seatHanler.removeUserRole(seatUserId, roleId);
  }
}

interface SeatUser {
  id: number;
  name: string;
  email: string;
  active: boolean;
  last_login: string;
  last_login_source: string;
  associated_character_ids: string[];
  main_character_id: string;
}
