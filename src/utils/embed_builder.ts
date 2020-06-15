import { User } from "discord.js";


export type embedType = {
  "embed": {
    title: string,
    description: string,
    color: number,
    "author": {
      name: string, icon_url: string,
    }
  }
}

type fieldObjectType = {
  name: string, value: string,
};


export class EmbedBuilder {
  private title: string;
  private description: string;
  private color: number;
  private author: User;

  constructor() {
    // NOTHING
  }

  async buildEmbed(title: string, description: string, color: number, author: User, fields?: fieldObjectType[]): Promise<embedType>{
    this.title = title;
    this.description = description;
    this.color = color;
    this.author = author;

    const embed = {
      "embed": {
        title, description, color,
        "author": {
          "name": author.tag,
          "icon_url": author.avatarURL(),
        },
        "fields": fields
      }
    };

    return embed;
  }
}