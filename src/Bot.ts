import Discord, { Message } from "discord.js";
import { config, BotConfig } from './config/config';
import { CommandHandler } from './utils/command_handler';
import Mongo from "./utils/mongo_handler";


class Bot {

  protected commandHandler: CommandHandler;
  protected mongo: Mongo;
  protected config: BotConfig;
  protected client: Discord.Client;

  constructor() {
    this.config = config;
  }

  protected validateConfig(config: BotConfig): void {
  if (!config.token) {
    throw new Error("You need to specify a bot token!");
  }
}
  
  protected initializeCommandHandler(): void {
    this.commandHandler = new CommandHandler(this.config);
  }

  protected initializeMongo(): void {
    this.mongo = new Mongo(this.config);
    this.mongo.connect();
  }

  protected initializeClient(): void {
    this.client = new Discord.Client();
  

    this.client.on("ready", () => {
      console.log(this.client.user.tag + " has been started!");
    }
    );

    this.client.on("message", (message: Message) => {
      this.commandHandler.handleMessage(message);
    }
    );

    this.client.on("error", (error) => {
      console.error("Discord Error: ", error);
    }
    );
  }

  public run(): void {
    this.validateConfig(this.config);
    this.initializeCommandHandler();
    this.initializeMongo();
    this.initializeClient();
    this.client.login(config.token);
}
}

export default Bot;