import { Message } from "discord.js";
import { Logger } from "winston";

import { Command } from "../commands/command";
import { CommandContext } from "../models/command_context";
import { reactor } from "../reactions/reactor";
import { BotConfig } from "../config/config";



/* Command Imports */
import { HelpCommand } from "../commands/help";
import { SetupCommand } from "../commands/setup";
import { SuggestCommand } from "../commands/suggest";


export class CommandHandler {
  private commands: Command[];
  private readonly prefix: string;
  private readonly logger: Logger;

  constructor(config: BotConfig, logger: Logger) {
    const commandClasses = [
      SetupCommand,
      SuggestCommand
    ]

    /* Map commands to array and add help command */
    this.commands = commandClasses.map(commandClass => new commandClass());
    this.commands.push(new HelpCommand(this.commands));
  
    /* Initialize prefix */
    this.prefix = config.prefix;

  /* Initialize logger */
    this.logger = logger;
  }

  async handleMessage(message: Message): Promise<void> {
    if (message.author.bot || !this.isCommand(message)) {
      return;
    }

    const commandContext = new CommandContext(message, this.prefix);

    const allowedCommands = this.commands.filter(command => command.hasPermissionToRun(commandContext));
    const matchedCommand = this.commands.find(command => command.commandNames.includes(commandContext.parsedCommandName));

    if (!allowedCommands.includes(matchedCommand) && this.commands.includes(matchedCommand)) {
      await message.reply(`You are not allowed to use that command!`);
      await reactor.failure(message);
    } else if (matchedCommand) {
      await matchedCommand.run(commandContext, this.logger).catch((err) => {
        this.logger.error(err);
        reactor.failure(message);
      });
    }

  }

  private isCommand(message: Message): boolean {
    return message.content.startsWith(this.prefix);
  }

}