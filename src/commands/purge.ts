import { Command } from "./command";
import { CommandContext } from "../models/command_context";
import { EmbedBuilder } from "../utils/embed_builder";
import { GuildMember, Collection, Role, Guild, TextChannel } from "discord.js";
import { config } from "../config/config";
import { Logger } from "winston";
import Settings from "../models/Settings";
import Suggestion from "../models/Suggestion";


export class PurgeCommand implements Command {
  readonly commandNames = ["purge"];
  readonly embed_builder: EmbedBuilder;


  constructor() {
    this.embed_builder = new EmbedBuilder();
  }


  async run(commandContext: CommandContext, _logger: Logger): Promise<void> {
    const days = commandContext.args.length > 0 ? parseInt(commandContext.args[0]) : 7;
    this.deleteSuggestions(days, commandContext.originalMessage.guild).then(async () => {
      const embedJSON = await this.embed_builder.buildEmbed('Suggestion Purge', `Deleted all suggestions older than ${days} days old`, 12390624, commandContext.author);
      await commandContext.originalMessage.channel.send(embedJSON);
    })

  }


  async deleteSuggestions(days: number, guild: Guild): Promise<void> {
    const settings = await Settings.findOne({ guild_id: guild.id });
    const suggestion_channel = guild.channels.cache.find(channel => channel.id === settings.suggestion_channel);
    if (!((suggestion_channel): suggestion_channel is TextChannel => suggestion_channel.type === "text")(suggestion_channel)) return;



    const date = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    Suggestion.find({ date: { $lte: date } }, (err, suggestions) => {
      if (err) throw new Error(err);
      suggestions.forEach(async suggestion => {
        (await suggestion_channel.messages.fetch(suggestion.message_id)).delete({ reason: 'Suggestion removed from DB.' });
      })
    });

    Suggestion.deleteMany({ date: { $lte: date } }, (err) => {
      return (err);
    })
  }


  hasPermissionToRun(commandContext: CommandContext): boolean {
    const author: GuildMember = commandContext.originalMessage.member;
    const roles: Collection<string, Role> = author.roles.cache;
    if (roles.map(role => role.name).includes(config.staffRole)) {
      return true;
    } else {
      return false;
    }
  }

  getHelpMessage(): string {
    return "purge [days]";
  }
}