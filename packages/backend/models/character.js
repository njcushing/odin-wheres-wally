import mongoose from "mongoose";

const Schema = mongoose.Schema;

const CharacterSchema = new Schema({
    image: { type: String },
    positionX: { type: Number },
    positionY: { type: Number },
    width: { type: Number },
    height: { type: Number },
});

export default mongoose.model("Character", CharacterSchema);
