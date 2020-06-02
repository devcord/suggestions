import { Guild, Message, User } from "discord.js";

export class CommandContext {
  readonly parsedCommandName: string;
  readonly args: string[];
  readonly originalMessage: Message;
  readonly commandPrefix: string;
  readonly guild: Guild;
  readonly author: User;

  constructor(message: Message, prefix: string) {
    this.commandPrefix = prefix;
    const splitMessage = message.content.slice(prefix.length).trim().split(/ +/g);

    this.parsedCommandName = splitMessage.shift().toLowerCase();
    this.args = splitMessage;
    this.originalMessage = message;

    this.author = message.author;

    this.guild = message.guild;
  }
}