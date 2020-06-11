import MONGOOSE from "mongoose";
import { SuggestionStatus } from "../types/SuggestionStatus";
import { Mongoose_SuggestionStatusType } from "./model_types/SuggestionStatus";

Object.defineProperty(MONGOOSE.Schema.Types, `SuggestionStatus`, {
  value: Mongoose_SuggestionStatusType
});

export type SuggestionDocument = MONGOOSE.Document & {
  suggestor: string;
  description: string;
  title: string;
  message_id: string;
  guild_id: string;
  up: number;
  down: number;
  net: number;
  date: Date;
  status: SuggestionStatus;
}



const suggestionSchema = new MONGOOSE.Schema({
  suggestor: { type: String, required: true },
  description: { type: String, required: true },
  title: { type: String, required: true },
  message_id: { type: String, required: true },
  guild_id: { type: String, required: true },
  up: { type: Number, default: 0 },
  down: { type: Number, default: 0 },
  net: { type: Number, default: 0},
  date: { type: Date, default: Date.now },
  status: { type: SuggestionStatus, default: SuggestionStatus.POSTED },
});

suggestionSchema.post('findOneAndUpdate', async function() {
  const suggestion = await this.model.findOne(this.getQuery());
  const net = suggestion.up - suggestion.down;
  suggestion.net = net;

  suggestion.save((err: string) => {
    if(err) throw new Error(err);
  });
});

const Suggestion = MONGOOSE.model<SuggestionDocument>('Suggestion', suggestionSchema);

export default Suggestion;