import { Command } from "./command";
import { CommandContext } from "../models/command_context";
import { EmbedBuilder } from "../utils/embed_builder";
import { TextChannel, Guild, User } from "discord.js";
import Settings, { SettingsDocument } from "../models/Settings"
import Suggestion, { SuggestionDocument } from "../models/Suggestion";
import { reactor } from "../reactions/reactor";

export class SuggestCommand implements Command {
  readonly commandNames = ["suggest", "s"];
  readonly embed_builder: EmbedBuilder;

  constructor() {
    this.embed_builder = new EmbedBuilder();
  }


  async run(commandContext: CommandContext): Promise<void> {
    const description = commandContext.args.join(' ');
    await this.createSuggestion(description, commandContext.author, commandContext.guild);
    reactor.success(commandContext.originalMessage);
  }

  async createSuggestion(desc: string, author: User, guild: Guild): Promise<SuggestionDocument | void> {
    this.getSequenceNextValue(guild.id).then(async (res) => {

      const suggestion = {
        suggestor: author.id,
        description: desc,
        title: 'Suggestion #' + res.incValue,
        message_id: '',
      };
      suggestion.message_id = await this.createSuggestionEmbed(suggestion, guild);

      Suggestion.create(suggestion).then((suggestion) => {

        return suggestion;
      })
    })
    
  }

  async createSuggestionEmbed(suggestion: { suggestor: any; description: any; title: any; }, guild: Guild): Promise<string> {
    const settings = await Settings.findOne({ guild_id: guild.id });
    const suggestion_channel_id = settings.suggestion_channel;

    const suggestion_channel = guild.channels.cache.find(channel => channel.id === suggestion_channel_id);

    const embedJSON = await this.embed_builder.buildEmbed(suggestion.title, suggestion.description, 12390624, (await guild.members.fetch(suggestion.suggestor)).user);

    if (!((suggestion_channel): suggestion_channel is TextChannel => suggestion_channel.type === "text")(suggestion_channel)) return;
    
    const embed = await suggestion_channel.send(embedJSON);

    // TODO: Customize these with setup
    await embed.react('👍🏻');
    await embed.react('👎🏻');

    return embed.id;
  }

  async getSequenceNextValue(guild_id: string): Promise<SettingsDocument> {
    return Settings.findOneAndUpdate({ guild_id }, { $inc: { incValue: 1 } });
}

  hasPermissionToRun(_commandContext: CommandContext): boolean {
    return true;
  }

  getHelpMessage(): string {
    return "suggest [Suggestion]";
  }
}