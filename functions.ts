import {
  GuildAuditLogsEntry,
  Guild,
  Client,
  ActivityType,
  TextChannel,
  MessageCreateOptions,
} from "discord.js";
import log, { LogLevelDesc } from "loglevel";

/**
 * .env 파일 또는 Docker 환경 변수에서 환경 변수를 로드합니다.
 */
export function loadEnvironmentVariables() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("./loadEnvironmentVariables");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    log.warn(".env not found. using docker environment variable");
  }
}

/**
 * audit log 대상의 닉네임을 가져옵니다.
 * @param {GuildAuditLogsEntry} auditLog
 * @param {Guild} guild
 *
 * @returns {Promise<string | null>} - 닉네임이 있는 경우 닉네임을, 없으면 null을 반환합니다.
 */
export async function getAuditTargetNickname(
  auditLog: GuildAuditLogsEntry,
  guild: Guild,
): Promise<string | null> {
  if (!auditLog.targetId) {
    throw new Error("auditLog.targetId is not defined.");
  }

  const user = await guild.client.users.fetch(auditLog.targetId);
  const member = await guild.members.fetch(user.id);

  if (!member.nickname) {
    return null;
  }

  return member.nickname;
}

interface DiscordRole {
  id: string;
  name: string;
}

/**
 * auditLogsEntry 에서의 뉴비 롤 권한 변경을 반영합니다.
 *
 * @param {GuildAuditLogsEntry} auditLog - 길드 auditLogsEntry.
 * @param {string|null} nickname - 유저의 닉네임.
 * @param {(a: string) => void} addFunction - 롤 추가시 호출할 함수.
 * @param {(a: string) => void} removeFunction - 롤 제거시 호출할 함수.
 */
export function reflectNewbieRoleChange(
  auditLog: GuildAuditLogsEntry,
  nickname: string | null,
  addFunction: (a: string) => void,
  removeFunction: (a: string) => void,
) {
  // 닉네임이 없는 경우 건너뜁니다. (닉네임이 없으면 니수와 맴버가 아님)
  if (nickname === null) return;

  for (const change of auditLog.changes) {
    for (const newRole of change.new as DiscordRole[]) {
      // 뉴비 롤이 아닌 경우 건너뜁니다.
      if (!getNewbieRoleIds().includes(newRole.id)) continue;

      if (change.key === "$add") {
        addFunction(nickname);
      } else if (change.key === "$remove") {
        removeFunction(nickname);
      }
    }
  }
}

/**
 * 뉴비 롤의 ID를 가져옵니다.
 *
 * @returns {string[]}
 */
export function getNewbieRoleIds(): string[] {
  if (!process.env.DISCORD_NEWBIE_ROLE_IDS) {
    throw new Error(
      "DISCORD_NEWBIE_ROLE_IDS is not defined in environment variables.",
    );
  }

  return JSON.parse(process.env.DISCORD_NEWBIE_ROLE_IDS) as string[];
}

/**
 * 디스코드 상태를 설정합니다.
 */
export function setDiscordPresence(client: Client, state: string) {
  client.user?.setPresence({
    activities: [
      {
        type: ActivityType.Custom,
        name: "custom",
        state: state,
      },
    ],
  });
}

/**
 * 환경 변수에서 안내 채널 ID 목록을 가져와 각 채널마다 공지 채널 메시지가 같은지 확인하고 다르면 새로운 메시지를 보냅니다.
 *
 * @param {Client} client - 디스코드 클라이언트
 * @param {MessageCreateOptions} msg - 메시지 내용
 */
export async function sendAnnouncementMsgs(
  client: Client,
  msg: MessageCreateOptions,
) {
  if (!process.env.DISCORD_NOTICE_CHANNEL_IDS) {
    throw new Error(
      "DISCORD_NOTICE_CHANNEL_IDS is not defined in environment variables.",
    );
  }

  const noticeChannelIds = JSON.parse(
    process.env.DISCORD_NOTICE_CHANNEL_IDS,
  ) as string[];
  for (const channelId of noticeChannelIds) {
    const channel = (await client.channels.fetch(channelId)) as TextChannel;

    log.info(
      `Checking notice channel... in guild: ${channel.guild.name} (${channel.guild.id})`,
    );
    const messages = await channel.messages.fetch();
    if (messages.size === 0) {
      log.info("No message found. Sending new message...");
      await channel.send(msg);
      continue;
    }

    if (messages.first()?.content.trim() != msg.content?.trim()) {
      log.info(
        "Message is not same. Deleting old message and sending new message...",
      );
      await messages.first()?.delete();
      await channel.send(msg);
    }

    log.info("Message is same.");
  }

  log.info("Checked All Notice Channels.");
}

/**
 * 로그 레벨을 설정합니다
 */
export function setDefaultLogLevel() {
  log.setDefaultLevel((process.env.LOG_LEVEL as LogLevelDesc) || "INFO");
}

export function getFormattedString(number: number, type: "number" | "percent") {
  if (type === "number") {
    return number.toLocaleString();
  } else if (type === "percent") {
    return `${(number * 100).toFixed(0)}`;
  }
}

export async function applyCommandAllowedGuildList(client: Client) {
  if (process.env.DISCORD_WHITELIST_GUILD_IDS) {
    const allowedGuilds = JSON.parse(
      process.env.DISCORD_WHITELIST_GUILD_IDS,
    ) as string[];

    client.allowedGuildIds = allowedGuilds;
    for (const guildId of allowedGuilds) {
      const guild = await client.guilds.fetch(guildId);
      log.info(`Allowed commands for guild: ${guild.name} (${guild.id})`);
    }
  } else if (process.env.DISCORD_BLACKLIST_GUILD_IDS) {
    const ignoredGuilds = JSON.parse(
      process.env.DISCORD_BLACKLIST_GUILD_IDS,
    ) as string[];

    client.ignoredGuildIds = ignoredGuilds;
    for (const guildId of ignoredGuilds) {
      const guild = await client.guilds.fetch(guildId);
      log.info(`Ignored commands for guild: ${guild.name} (${guild.id})`);
    }
  }
}
