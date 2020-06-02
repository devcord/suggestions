import MONGOOSE from 'mongoose';
import { BotConfig } from "../config/config";

export default class Mongo {
  /* Attributes */
  private readonly uri: string;

  constructor(config: BotConfig) {
    this.uri = config.mongo_uri;
  }

  public connect(): Promise<void> {
    return MONGOOSE.connect(this.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }).then(() => {
      console.log(`Connected to MongoDb at ${this.uri}`);
      return;
    }).catch(err => {
      console.error(err);
      process.exit(1);
    })
  }
}