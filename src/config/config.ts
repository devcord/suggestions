import * as dotenv from 'dotenv';

dotenv.config();

export type BotConfig = {
  botName: string,
  token: string,
  prefix: string,
  staffRole: string,
  mongo_uri: string,
};

export const config: BotConfig = {
  botName: process.env.BOT_NAME || "Suggestion Bot",
  token: process.env.TOKEN || "",
  prefix: process.env.PREFIX || "",
  staffRole: process.env.STAFF_ROLE || "",
  mongo_uri: process.env.MONGO_URI || "",
};