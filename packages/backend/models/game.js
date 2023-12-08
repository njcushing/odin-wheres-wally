import mongoose from "mongoose";

import CharacterSchema from "./character.js";

const Schema = mongoose.Schema;

const GameSchema = new Schema({
    imageUrl: { type: String },
    imageWidth: { type: Number },
    imageHeight: { type: Number },
    characters: [
        {
            character: { type: Schema.Types.ObjectId, ref: "Character" },
            positionX: { type: Number },
            positionY: { type: Number },
            width: { type: Number },
            height: { type: Number },
        },
    ],
});

export default mongoose.model("Game", GameSchema);
