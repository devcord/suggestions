import MONGOOSE from 'mongoose';
import { BotConfig } from "../config/config";
import winston from 'winston';

export default class Mongo {
  /* Attributes */
  private readonly uri: string;
  private readonly logger;

  constructor(config: BotConfig, logger: winston.Logger) {
    this.uri = config.mongo_uri;
    this.logger = logger;
  }

  public connect(): Promise<void> {
    return MONGOOSE.connect(this.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }).then(() => {
      this.logger.info(`Connected to MongoDB`);
      return;
    }).catch(err => {
      console.error(err);
      process.exit(1);
    })
  }
}