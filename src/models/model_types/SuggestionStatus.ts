import MONGOOSE from "mongoose";
import { SuggestionStatus } from "../../types/SuggestionStatus";

export class Mongoose_SuggestionStatusType extends MONGOOSE.SchemaType {
  constructor(key: string, options: unknown) {
    super(key, options, 'SuggestionStatus');
  }

  cast(val: never): unknown {
    if (!Object.values(SuggestionStatus).includes(val)) {
      throw new Error('SuggestionStatus: ' + val + ' is not a valid suggestion type.');
    } else {
      return val;
    }
  }
}