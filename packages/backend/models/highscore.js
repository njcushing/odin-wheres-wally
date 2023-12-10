import mongoose from "mongoose";

const Schema = mongoose.Schema;

const HighScoreSchema = new Schema({
    first_name: { type: String },
    last_name: { type: String },
    time: { type: Number },
    date_achieved: { type: Date, default: Date.now },
});

export default mongoose.model("HighScore", HighScoreSchema);
