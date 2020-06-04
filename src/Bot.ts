import Discord, { Message, User, MessageReaction, PartialTypes } from "discord.js";
import { config, BotConfig } from './config/config';
import { CommandHandler } from './utils/command_handler';
import { ReactionHandler } from './utils/reaction_handler';
import Mongo from "./utils/mongo_handler";


class Bot {

  protected commandHandler: CommandHandler;
  protected reactionHandler: ReactionHandler;
  protected mongo: Mongo;
  protected config: BotConfig;
  protected client: Discord.Client;
  protected partials: PartialTypes[];

  constructor(partials: PartialTypes[]) {
    this.config = config;
    this.partials = partials;
  }

  protected validateConfig(config: BotConfig): void {
  if (!config.token) {
    throw new Error("You need to specify a bot token!");
  }
}
  
  protected initializeCommandHandler(): void {
    this.commandHandler = new CommandHandler(this.config);
  }

  protected initializeReactionsHandler(): void {
    this.reactionHandler = new ReactionHandler();
  }

  protected initializeMongo(): void {
    this.mongo = new Mongo(this.config);
    this.mongo.connect();
  }

  protected initializeClient(): void {
    this.client = new Discord.Client({partials: this.partials});
  

    this.client.on("ready", () => {
      console.log(this.client.user.tag + " has been started!");
    }
    );

    this.client.on("message", (message: Message) => {
      this.commandHandler.handleMessage(message);
    }
    );

    this.client.on("messageReactionAdd", async (reaction: MessageReaction, user: User) => {
      if (reaction.message.partial) {
        try {
          await reaction.message.fetch();
        } catch (err) {
          console.error(`Something went wrong when fetching the message: ${err}`);
        }
      }
      this.reactionHandler.handleReactionAdd(reaction, user);
    })

    this.client.on("messageReactionRemove", async (reaction: MessageReaction, user: User) => {
      if (reaction.message.partial) {
        try {
          await reaction.message.fetch();
        } catch (err) {
          console.error(`Something went wrong when fetching the message: ${err}`);
        }
      }
      this.reactionHandler.handleReactionRemove(reaction, user);
    })

    this.client.on("error", (error) => {
      console.error("Discord Error: ", error);
    }
    );
  }

  public run(): void {
    this.validateConfig(this.config);
    this.initializeCommandHandler();
    this.initializeReactionsHandler();
    this.initializeMongo();
    this.initializeClient();
    this.client.login(config.token);
}
}

export default Bot;