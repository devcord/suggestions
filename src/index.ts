import Discord, { Message } from "discord.js";
import { config, BotConfig } from './config/config';
import { CommandHandler } from './utils/command_handler';

function validateConfig(config: BotConfig) {
  if (!config.token) {
    throw new Error("You need to specify a bot token!");
  }
}

validateConfig(config);

const commandHandler = new CommandHandler(config);

const client = new Discord.Client();

client.on("ready", () => {
  console.log(client.user.tag + " has been started!");
}
);

client.on("message", (message: Message) => {
  commandHandler.handleMessage(message);
}
);

client.on("error", (error) => {
  console.error("Discord Error: ", error);
}
);

client.login(config.token);