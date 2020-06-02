import { Command } from "./command";
import { CommandContext } from "../models/command_context";
import { config } from "../config/config";
import { EmbedBuilder } from "../utils/embed_builder";
import { GuildMember, Role, Collection } from "discord.js";
import Settings, {SettingsDocument} from "../models/Settings"

export class SetupCommand implements Command {
  readonly commandNames = ["setup", "s"];

  private commands: Command[];

  private embed_builder: EmbedBuilder;

  constructor(commands: Command[]) {
    this.commands = commands;
    this.embed_builder = new EmbedBuilder();
  }


  async run(commandContext: CommandContext): Promise<void> {
    const settings = await this.checkSettings(commandContext.originalMessage.guild.id);
    
    // DEBUG: Remove this after testing
    console.log(settings)
    
    if (settings) {
      // Change settings
    } else {
      // Create settings
    }
  }

  async checkSettings(guild_id: string): Promise<SettingsDocument | boolean> {
    const settings = await Settings.findOne({ guild_id });
    if (settings) {
      return Promise.resolve(settings)
    } else {
      return Promise.resolve(false);
    }
  }

  hasPermissionToRun(commandContext: CommandContext): boolean {
    const author: GuildMember = commandContext.originalMessage.member;
    const roles: Collection<string, Role> = author.roles.cache;
    if (roles.map(role => role.name).includes(config.staffRole)) {  
      return true;
    }
    return false;
  }

  getHelpMessage(): string {
    return "I think you already know how to use this command...";
  }
}