import MONGOOSE from "mongoose";
import { SuggestionStatus } from "../types/SuggestionStatus";
import { Mongoose_SuggestionStatusType } from "./model_types/SuggestionStatus";


MONGOOSE.Schema.Types.SuggestionStatus = Mongoose_SuggestionStatusType;

export type SuggestionDocument = MONGOOSE.Document & {
  suggestor: string;
  description: string;
  title: string;
  up: number;
  down: number;
  date: Date;
  status: SuggestionStatus;
}



const suggestionSchema = new MONGOOSE.Schema({
  suggestor: { Type: String, Required: true },
  description: { Type: String, Required: true },
  title: { Type: String, Required: true },
  up: { Type: Number, default: 0 },
  down: { Type: Number, default: 0 },
  date: { Type: Date, default: Date.now },
  status: { Type: SuggestionStatus, Required: true },
});

const Suggestion = MONGOOSE.model<SuggestionDocument>('Suggestion', suggestionSchema);