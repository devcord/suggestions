import * as dotenv from 'dotenv';

dotenv.config();

export type BotConfig = {
  token: string,
  prefix: string,
  staffRole: string,
  mongo_uri: string,
};

export const config: BotConfig = {
  token: process.env.TOKEN || "",
  prefix: process.env.PREFIX || "",
  staffRole: process.env.STAFF_ROLE || "",
  mongo_uri: process.env.MONGO_URI || "",
};