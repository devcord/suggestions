import { Command } from "./command";
import { CommandContext } from "../models/command_context";
import { EmbedBuilder } from "../utils/embed_builder";
import { GuildMember, Collection, Role, Guild, Message, TextChannel } from "discord.js";
import { config } from "../config/config";
import { Logger } from "winston";
import { reactor } from "../reactions/reactor";
import Suggestion, { SuggestionDocument } from "../models/Suggestion";
import { SuggestionStatus } from "../types/SuggestionStatus";
import Settings from "../models/Settings";

export class TopCommand implements Command {
  readonly commandNames = ["top", "t"];
  readonly embed_builder: EmbedBuilder;


  constructor() {
    this.embed_builder = new EmbedBuilder();
  }


  async run(commandContext: CommandContext, logger: Logger): Promise<void> {
    const days = commandContext.args.length > 0 ? parseInt(commandContext.args[0]) : 7;

    this.getSuggestions(days, commandContext.originalMessage.guild).then((suggestions) => {

      this.sendTopSuggestions(suggestions, commandContext.originalMessage);
      this.updateSuggestions(suggestions, commandContext.originalMessage.guild);
    }).catch(async (err: string) => {
      logger.error(err);
      await reactor.failure(commandContext.originalMessage);
    })
  }


  async sendTopSuggestions(suggestions: SuggestionDocument[], message: Message): Promise<void> {
    let embedJson;
    suggestions.forEach(async suggestion => {
      embedJson = await this.embed_builder.buildEmbed(suggestion.title, suggestion.description, 12390624, (await message.guild.members.fetch(suggestion.suggester)).user);
      const embed = await message.channel.send(embedJson);

      await embed.react('❌');
      await embed.react('✅');
    });

  }

  async getSuggestions(days: number, guild: Guild): Promise<SuggestionDocument[]> {
    const date = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const suggestions: SuggestionDocument[] = await Suggestion.find({
      guild_id: guild.id,
      status: SuggestionStatus.POSTED,
      date: { $gte: date },
    }).sort({ net: -1 }).limit(5);

    return suggestions;
  }

  async updateSuggestions(suggestions: SuggestionDocument[], guild: Guild): Promise<void> {
    const settings = await Settings.findOne({ guild_id: guild.id });
    const suggestion_channel = guild.channels.cache.find(channel => channel.id === settings.suggestion_channel);

    suggestions.forEach(async suggestion => {
      
      Suggestion.findOneAndUpdate({ _id: suggestion._id }, {
        status: SuggestionStatus.PENDING
      }, (err) => {
        if (err) {
          // Error getting the document
      } });

      const embedJSON = await this.embed_builder.buildEmbed(suggestion.title, suggestion.description, 12390624, (await guild.members.fetch(suggestion.suggester)).user, [{ name: "Status", value: SuggestionStatus.PENDING }]);

      if (!((suggestion_channel): suggestion_channel is TextChannel => suggestion_channel.type === "text")(suggestion_channel)) return;

      (await suggestion_channel.messages.fetch(suggestion.message_id)).edit(embedJSON).catch((err) => {
        if (err) return
        // Error editing the message
      });
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
    return "top [days]";
  }
}