import { Command } from "./command";
import { CommandContext } from "../models/command_context";
import { EmbedBuilder } from "../utils/embed_builder";
import { TextChannel, Guild, User } from "discord.js";
import Settings, { SettingsDocument } from "../models/Settings"
import Suggestion, { SuggestionDocument } from "../models/Suggestion";
import { reactor } from "../reactions/reactor";
import { Logger } from "winston";

export class SuggestCommand implements Command {
  readonly commandNames = ["suggest", "s"];
  readonly embed_builder: EmbedBuilder;

  private logger: Logger;

  constructor() {
    this.embed_builder = new EmbedBuilder();
  }


  async run(commandContext: CommandContext, logger: Logger): Promise<void> {
    const description = commandContext.args.join(' ');
    await this.createSuggestion(description, commandContext.author, commandContext.guild);
    reactor.success(commandContext.originalMessage);

    this.logger = logger;
  }

  async createSuggestion(desc: string, author: User, guild: Guild): Promise<SuggestionDocument | void> {
    this.getSequenceNextValue(guild.id).then(async (res) => {
      // TODO: Check if res is null, which means no settings were found

      const suggestion = {
        suggestor: author.id,
        description: desc,
        title: 'Suggestion #' + res.incValue,
        message_id: '',
        guild_id: guild.id,
      };
      suggestion.message_id = await this.createSuggestionEmbed(suggestion, guild);

      Suggestion.create(suggestion).then((suggestion) => {
        this.logger.info(`Created suggestion ${res.incValue} on guild ${guild.id}`)
        return suggestion;
      }).catch((error) => {
        this.logger.error(`There was an error creating suggestion ${res.incValue}. ${error}`);
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

  hasPermissionToRun(): boolean {
    return true;
  }

  getHelpMessage(): string {
    return "suggest [Suggestion]";
  }
}