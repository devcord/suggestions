import MONGOOSE from "mongoose";
import { SuggestionStatus } from "../types/SuggestionStatus";
import { Mongoose_SuggestionStatusType } from "./model_types/SuggestionStatus";


// @ts-ignore
MONGOOSE.Schema.Types.SuggestionStatus = Mongoose_SuggestionStatusType;

export type SuggestionDocument = MONGOOSE.Document & {
  suggestor: string;
  description: string;
  title: string;
  message_id: string;
  up: number;
  down: number;
  date: Date;
  status: SuggestionStatus;
}



const suggestionSchema = new MONGOOSE.Schema({
  suggestor: { type: String, required: true },
  description: { type: String, required: true },
  title: { type: String, required: true },
  message_id: {type: String, required: true},
  up: { type: Number, default: 0 },
  down: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
  status: { type: SuggestionStatus, default: SuggestionStatus.POSTED },
});

const Suggestion = MONGOOSE.model<SuggestionDocument>('Suggestion', suggestionSchema);

export default Suggestion;