import MONGOOSE from "mongoose";

export type SettingsDocument = MONGOOSE.Document & {
  suggestion_channel: string;
  guild_id: string;
}

const settingsSchema = new MONGOOSE.Schema({
  suggestion_channel: { type: String, required: true },
  guild_id: { type: String, required: true},
});

const Settings = MONGOOSE.model<SettingsDocument>('Settings', settingsSchema);

export default Settings;