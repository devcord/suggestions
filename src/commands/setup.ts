import { Command } from "./command";
import { CommandContext } from "../models/command_context";
import { config } from "../config/config";
import { EmbedBuilder } from "../utils/embed_builder";
import { GuildMember, Role, Collection } from "discord.js";
import Settings, { SettingsDocument } from "../models/Settings";
import { reactor } from "../reactions/reactor";
import { Logger } from "winston";


export class SetupCommand implements Command {
  readonly commandNames = ["setup"];
  readonly embed_builder: EmbedBuilder;

  constructor() {
      this.embed_builder = new EmbedBuilder();
  }


  async run(commandContext: CommandContext, logger: Logger): Promise<void> {
    const guild_id = commandContext.guild.id;
    let channel_id: string;
    if (commandContext.args.length === 0) {

      channel_id = commandContext.originalMessage.channel.id;     
      this.createSettings(guild_id, channel_id).then(async () => {

        const embed = await this.embed_builder.buildEmbed('Settings', `The settings have been updated to use <#${channel_id}> for posting suggestions`, 12390624, commandContext.author);
        commandContext.originalMessage.channel.send(embed);
        
        logger.info(`Settings configured for guild ${guild_id}`);
      }).catch(async (err) => {
        // React bad
        logger.error(err);
        await reactor.failure(commandContext.originalMessage);
      });
    } else {
      channel_id = commandContext.args[0].replace(/[^0-9]/g, '');
      
      if (!commandContext.guild.channels.cache.map(channel => channel.id).includes(channel_id)) {
        const embed = await this.embed_builder.buildEmbed('Settings - Failure', `Channel id ${channel_id} does not exist in the guild!`, 12390624, commandContext.author);
        commandContext.originalMessage.channel.send(embed);
     
      } else {
       
        this.createSettings(guild_id, channel_id).then(async () => {
          const embed = await this.embed_builder.buildEmbed('Settings', `The settings have been updated to use <#${channel_id}> for posting suggestions`, 12390624, commandContext.author);
          commandContext.originalMessage.channel.send(embed);
          logger.info(`Settings updated for guild ${guild_id}`);
        }).catch(async (err) => {
          // React bad
          logger.error(err);

          await reactor.failure(commandContext.originalMessage);
        });

      }
    }
  }

  async checkSettings(guild_id: string): Promise<SettingsDocument | boolean> {
    const settings = await Settings.findOne({ guild_id });
    if (settings) {
      return Promise.resolve(settings)
    } else {
      return Promise.resolve(false);
    }
  }

  async createSettings(guild_id: string, channel_id: string): Promise<void> {
    await Settings.updateOne({ guild_id }, {
      suggestion_channel: channel_id,
      guild_id,
    }, {
        upsert: true,
      setDefaultsOnInsert: true,
    }).catch((err) => {
      Promise.reject(err);
    }).then((settings) => {
      Promise.resolve(settings);
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
    return "setup [channel_id]";
  }
}