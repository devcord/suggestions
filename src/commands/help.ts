import { Command } from "./command";
import { CommandContext } from "../models/command_context";
import { config } from "../config/config";
import { EmbedBuilder } from "../utils/embed_builder";

export class HelpCommand implements Command {
  readonly commandNames = ["help", "halp", "hlep", "h"];

  private commands: Command[];

  private embed_builder: EmbedBuilder;

  constructor(commands: Command[]) {
    this.commands = commands;
    this.embed_builder = new EmbedBuilder();
  }


  async run(commandContext: CommandContext): Promise<void> {
    const allowedCommands = this.commands.filter(command => command.hasPermissionToRun(commandContext));
    if (commandContext.args.length == 0) {
      // No command specified, give the user a list of all commands they can use.
      const commandNames = allowedCommands.map(command => command.commandNames[0]);

     const embed = await this.embed_builder.buildEmbed('Help', `Here is a list of commands you can run: \n - ${commandNames.join("\n - ")} \nTry ${config.prefix}help [command_name] to learn more about one of them.`, 12390624, commandContext.originalMessage.author);

      await commandContext.originalMessage.channel.send(embed);
      return;
    }

    const matchedCommand = this.commands.find(command => command.commandNames.includes(commandContext.args[0]));
    if (!matchedCommand) {
      await commandContext.originalMessage.channel.send(
        `I don't know about that command :(. Try ${config.prefix}help to find all commands you can use.`
      );
      return Promise.reject("Unrecognized command");
    } else if (allowedCommands.includes(matchedCommand)) {
      await commandContext.originalMessage.reply(this.buildHelpMessageForCommand(matchedCommand, commandContext));
    }
  }

  private buildHelpMessageForCommand(command: Command, context: CommandContext): string {
    return `${command.getHelpMessage(context.commandPrefix)}\nCommand aliases: ${command.commandNames.join(", ")}`;
  }

  hasPermissionToRun(): boolean {
    return true;
  }

  getHelpMessage(): string {
    return "I think you already know how to use this command...";
  }
}