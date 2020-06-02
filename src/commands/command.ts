import { CommandContext } from "../models/command_context";
import { EmbedBuilder } from "../utils/embed_builder";

export interface Command {
  readonly commandNames: string[];
  readonly embed_builder: EmbedBuilder;

  getHelpMessage(commandPrefix: string): string;

  run(parsedUserCommand: CommandContext): Promise<void>;

  hasPermissionToRun(parsedUserCommand: CommandContext): boolean;
}