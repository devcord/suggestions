import MONGOOSE from "mongoose";

export class Mongoose_SuggestionStatusType extends MONGOOSE.SchemaType {
  constructor(key: any, options: any) {
    super(key, options, 'SuggestionStatus');
  }

  cast(val: any) {
    if (!Object.values(SuggestionStatus).includes(val)) {
      throw new Error('SuggestionStatus: ' + val + ' is not a valid suggestion type.');
    } else {
      return val;
    }
  }
}