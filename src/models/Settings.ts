import MONGOOSE from "mongoose";

export type SettingsDocument = MONGOOSE.Document & {
  suggestion_channel: string;
  guild_id: string;
  incValue: number;
}

const settingsSchema = new MONGOOSE.Schema({
  suggestion_channel: { type: String, required: true },
  guild_id: { type: String, required: true },
  incValue: { type: Number, default: 0},
});

const Settings = MONGOOSE.model<SettingsDocument>('Settings', settingsSchema);

export default Settings;