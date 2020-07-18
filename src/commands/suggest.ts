import { Command } from "./command";
import { CommandContext } from "../models/command_context";
import { EmbedBuilder } from "../utils/embed_builder";
import { TextChannel, Guild, User, Message } from "discord.js";
import Settings, { SettingsDocument } from "../models/Settings"
import Suggestion, { SuggestionDocument } from "../models/Suggestion";
import { SuggestionStatus } from "../types/SuggestionStatus";
import { reactor } from "../reactions/reactor";
import { Logger } from "winston";

import isValidSuggestion from '../utils/validators'

interface SuggestionObject {
  suggester: string;
  description: string;
  title: string;
  message_id: string;
  guild_id: string;
}

export class SuggestCommand implements Command {
  readonly commandNames = ["suggest", "s"];
  readonly embed_builder: EmbedBuilder;

  private logger: Logger;

  constructor() {
    this.embed_builder = new EmbedBuilder();
  }



  async run(commandContext: CommandContext, logger: Logger): Promise<void> {
    const description = commandContext.args.join(' ');
    await this.createSuggestion(description, commandContext.author, commandContext.guild, commandContext.originalMessage);
    reactor.success(commandContext.originalMessage);

    this.logger = logger;
  }

  async createSuggestion(desc: string, author: User, guild: Guild, orgMsg: Message): Promise<SuggestionDocument | void> {
    if (!isValidSuggestion(desc)) {
      this.logger.error(`The suggestion creation failed due to a validation check.`);
      orgMsg.react('❌');
      orgMsg.reply('The suggestion you provided failed the check. Please make sure it is a valid suggestion.')
    }
    this.getSequenceNextValue(guild.id).then(async (res) => {
      // TODO: Check if res is null, which means no settings were found
      if (!res) {
        orgMsg.react('❌');
        orgMsg.reply('Something went horribly wrong.')
        return;
      }

      const suggestion: SuggestionObject = {
        suggester: author.id,
        description: desc,
        title: 'Suggestion #' + res.incValue,
        message_id: '',
        guild_id: guild.id,
      };

      suggestion.message_id = await this.createSuggestionEmbed(suggestion, guild);

      Suggestion.create(suggestion).then((suggestion) => {
        this.logger.info(`Created suggestion ${res.incValue} on guild ${guild.id}`);
        return suggestion;
      }).catch((error) => {
        this.logger.error(`There was an error creating suggestion ${res.incValue}. ${error}`);
      })

    })

  }

  async createSuggestionEmbed(suggestion: { suggester: string; description: string; title: string; }, guild: Guild): Promise<string> {
    const settings = await Settings.findOne({ guild_id: guild.id });
    const suggestion_channel_id = settings.suggestion_channel;

    const suggestion_channel = guild.channels.cache.find(channel => channel.id === suggestion_channel_id);

    const embedJSON = await this.embed_builder.buildEmbed(suggestion.title, suggestion.description, 12390624, (await guild.members.fetch(suggestion.suggester)).user, [{ name: "Status", value: SuggestionStatus.POSTED }]);

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