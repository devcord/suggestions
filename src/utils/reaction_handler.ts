import { Message, MessageReaction, User } from "discord.js";
import Suggestion from "../models/Suggestion";


export class ReactionHandler {

  constructor() {
    // Nothing
  }

  async handleReactionAdd(reaction: MessageReaction, user: User): Promise<void> {
    if (user.bot) return;
    const message: Message = reaction.message;
    this.addReaction(reaction.emoji.name, message);
  }

  async addReaction(reaction: string, message: Message): Promise<void> {
    if (reaction === "👍🏻") {
      Suggestion.findOneAndUpdate({ message_id: message.id }, { $inc: { up: 1 } }, (err, _) => {
        if (err) throw new Error(err);

      });
    } else if (reaction === "👎🏻") {
      Suggestion.findOneAndUpdate({ message_id: message.id }, { $inc: { down: 1 } }, (err, _) => {
        if (err) throw new Error(err);
        
      });
    }
  }

  async handleReactionRemove(reaction: MessageReaction, user: User): Promise<void> {
    if (user.bot) return;
    const message: Message = reaction.message;
    this.removeReaction(reaction.emoji.name, message);
  }


  async removeReaction(reaction: string, message: Message): Promise < void> {
    if(reaction === "👍🏻") {
    Suggestion.findOneAndUpdate({ message_id: message.id }, { $inc: { up: -1 } }, (err, _) => {
              if (err) throw new Error(err);

    });
  } else if (reaction === "👎🏻") {
    Suggestion.findOneAndUpdate({ message_id: message.id }, { $inc: { down: -1 } }, (err, _) => {
              if (err) throw new Error(err);

    });
  }
  }
}