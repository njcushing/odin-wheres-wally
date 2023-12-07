import mongoose from "mongoose";

const Schema = mongoose.Schema;

const GameSchema = new Schema({
    image: { type: String },
    imageSize: { type: ImageSizeSchema },
    characters: [{ type: CharacterSchema }],
});

const ImageSizeSchema = new Schema({
    width: { Type: Number },
    height: { Type: Number },
});

const CharacterSchema = new Schema({
    position: { type: Number },
    width: { type: Number },
    height: { type: Number },
});

export default mongoose.model("Game", GameSchema);
