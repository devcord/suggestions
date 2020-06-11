import { Message, MessageReaction, User } from "discord.js";
import Suggestion from "../models/Suggestion";
import { SuggestionStatus } from "../types/SuggestionStatus";
import { Logger } from "winston";

export class ReactionHandler {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async handleReactionAdd(reaction: MessageReaction, user: User): Promise<void> {
    if (user.bot) return;
    const message: Message = reaction.message;
    this.addReaction(reaction.emoji.name, message);
  }

  async addReaction(reaction: string, message: Message): Promise<void> {
    // Check if message exists
    if ((await Suggestion.find({ message_id: message.id }).limit(1)).length > 0) {
      if (reaction === "👍🏻") {
        Suggestion.findOneAndUpdate({ message_id: message.id, status: SuggestionStatus.POSTED }, { $inc: { up: 1 } }, (err: string) => {
         if(err) this.logger.error(err);
        });
      } else if (reaction === "👎🏻") {
        Suggestion.findOneAndUpdate({ message_id: message.id, status: SuggestionStatus.POSTED }, { $inc: { down: 1 } }, (err: string) => {
          if (err) this.logger.error(err);
        });
      }
    }
  }

  async handleReactionRemove(reaction: MessageReaction, user: User): Promise<void> {
    if (user.bot) return;
    const message: Message = reaction.message;
    this.removeReaction(reaction.emoji.name, message);
  }


  async removeReaction(reaction: string, message: Message): Promise < void> {
    if (reaction === "👍🏻" && (await Suggestion.find({ message_id: message.id, status: SuggestionStatus.POSTED  }).limit(1)).length > 0) {
      
    Suggestion.findOneAndUpdate({ message_id: message.id }, { $inc: { up: -1 } }, (err) => {
      if (err) this.logger.error(err);
    });
    } else if (reaction === "👎🏻" && (await Suggestion.find({ message_id: message.id, status: SuggestionStatus.POSTED  }).limit(1)).length > 0) {
    Suggestion.findOneAndUpdate({ message_id: message.id }, { $inc: { down: -1 } }, (err) => {
      if (err) this.logger.error(err);
    });
  }
  }
}