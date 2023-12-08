import mongoose from "mongoose";

import CharacterSchema from "./character.js";

const Schema = mongoose.Schema;

const GameSchema = new Schema({
    image: { type: String },
    imageWidth: { type: Number },
    imageHeight: { type: Number },
    characters: [{ type: CharacterSchema }],
});

export default mongoose.model("Game", GameSchema);
