import mongoose from "mongoose";

const Schema = mongoose.Schema;

const CharacterSchema = new Schema({
    name: { type: String },
    imageUrl: { type: String },
});

export default mongoose.model("Character", CharacterSchema);
