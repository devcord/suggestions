import { Message, MessageReaction } from "discord.js";

const POSITIVE = ["👍", "🎮", "💚", "🍜"];
const FAILURE = ["⛔", ":X:"];

export class Reactor {
  enableReactions: boolean;
  
  constructor(enableReactions: boolean) {
    this.enableReactions = enableReactions;
  }

  async success(message: Message): Promise<MessageReaction> {
    if (!this.enableReactions) return;
    return message.react(this.getRandom(POSITIVE));
  }

  async failure(message: Message): Promise<MessageReaction> {
    if (!this.enableReactions) return;
    
    await this.removeReactions(message);
    return message.react(this.getRandom(FAILURE));
  }

  private getRandom(array: string[]): string {
    return array[Math.floor(Math.random() * array.length)];
  }

  private async removeReactions(message: Message) {
    await message.reactions.removeAll();
  }
}

export const reactor = new Reactor(true);