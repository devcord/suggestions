import { Message, MessageReaction, User, Guild, TextChannel } from "discord.js";
import Suggestion, { SuggestionDocument } from "../models/Suggestion";
import { SuggestionStatus } from "../types/SuggestionStatus";
import { Logger } from "winston";
import Settings from "../models/Settings";
import { EmbedBuilder } from "./embed_builder";

export class ReactionHandler {
  private logger: Logger;
  readonly embed_builder: EmbedBuilder;

  constructor(logger: Logger) {
    this.logger = logger;
    this.embed_builder = new EmbedBuilder();

  }

  async handleReactionAdd(reaction: MessageReaction, user: User): Promise<void> {
    if (user.bot) return;
    const message: Message = reaction.message;
    this.addReaction(reaction.emoji.name, message);
  }

  async addReaction(reaction: string, message: Message): Promise<void> {
    const suggestion_vote = ["👍🏻", "👎🏻"];
    if (suggestion_vote.includes(reaction) && (await Suggestion.find({ message_id: message.id }).limit(1)).length == 0) return;

    if (reaction === "👍🏻") {
      Suggestion.findOneAndUpdate({ message_id: message.id, status: SuggestionStatus.POSTED }, { $inc: { up: 1 } }, (err: string) => {
        if (err) this.logger.error(err);
      });
    } else if (reaction === "👎🏻") {
      Suggestion.findOneAndUpdate({ message_id: message.id, status: SuggestionStatus.POSTED }, { $inc: { down: 1 } }, (err: string) => {
        if (err) this.logger.error(err);
      });
    } else if (reaction === "❌") {
      const title = message.embeds[0].title;

      Suggestion.findOneAndUpdate({ title }, { status: SuggestionStatus.DENIED }, (err: string, doc: SuggestionDocument) => {
        if (err) this.logger.error(err);
        this.handleDenied(doc, message.guild);
        message.reactions.removeAll();
        message.react("❌");
      });
    } else if (reaction === "✅") {
      const title = message.embeds[0].title;

      Suggestion.findOneAndUpdate({ title }, { status: SuggestionStatus.ACCEPTED }, (err: string, doc: SuggestionDocument) => {
        if (err) this.logger.error(err);
        this.handleApproval(doc, message.guild);
        message.reactions.removeAll();
        message.react("✅");
      });
    }
  }

  async handleReactionRemove(reaction: MessageReaction, user: User): Promise<void> {
    if (user.bot) return;
    const message: Message = reaction.message;
    this.removeReaction(reaction.emoji.name, message);
  }


  async removeReaction(reaction: string, message: Message): Promise<void> {
    if ((await Suggestion.find({ message_id: message.id }).limit(1)).length == 0) return;

    if (reaction === "👍🏻") {
      Suggestion.findOneAndUpdate({ message_id: message.id }, { $inc: { up: -1 } }, (err) => {
        if (err) this.logger.error(err);
      });
    } else if (reaction === "👎🏻") {
      Suggestion.findOneAndUpdate({ message_id: message.id }, { $inc: { down: -1 } }, (err) => {
        if (err) this.logger.error(err);
      });
    }
  }

  async handleApproval(suggestion: SuggestionDocument, guild: Guild): Promise<void> {
    const settings = await Settings.findOne({ guild_id: guild.id });
    const suggestion_channel = guild.channels.cache.find(channel => channel.id === settings.suggestion_channel);
    if (!((suggestion_channel): suggestion_channel is TextChannel => suggestion_channel.type === "text")(suggestion_channel)) return;

    const embedJSON = await this.embed_builder.buildEmbed(suggestion.title, suggestion.description, 32768, (await guild.members.fetch(suggestion.suggester)).user, [{ name: "Status", value: SuggestionStatus.ACCEPTED }]);

    const msg = (await suggestion_channel.messages.fetch(suggestion.message_id)).edit(embedJSON);
    (await msg).reactions.removeAll();

    const id = suggestion.title.split("#")[1];
    this.logger.info(`Suggestion ${id} has been approved on ${guild.id}`)
  }

  async handleDenied(suggestion: SuggestionDocument, guild: Guild): Promise<void> {
    const settings = await Settings.findOne({ guild_id: guild.id });
    const suggestion_channel = guild.channels.cache.find(channel => channel.id === settings.suggestion_channel);
    if (!((suggestion_channel): suggestion_channel is TextChannel => suggestion_channel.type === "text")(suggestion_channel)) return;

    const embedJSON = await this.embed_builder.buildEmbed(suggestion.title, suggestion.description, 16711680, (await guild.members.fetch(suggestion.suggester)).user, [{ name: "Status", value: SuggestionStatus.DENIED }]);

    const msg = (await suggestion_channel.messages.fetch(suggestion.message_id)).edit(embedJSON);
    (await msg).reactions.removeAll();

    const id = suggestion.title.split("#")[1];
    this.logger.info(`Suggestion ${id} has been denied on ${guild.id}`)
  }
}