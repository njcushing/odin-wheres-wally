import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import Game from "../models/game.js";
import Character from "../models/character.js";

const initialiseMongoServer = async () => {
    // Create database and connect
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    mongoose.set("strictQuery", false); // Prepare for Mongoose 7
    await mongoose.connect(mongoUri);

    mongoose.connection.on("error", async (error) => {
        if (error.message.code === "ETIMEDOUT") {
            console.log(error);
            await mongoose.connect(mongoUri);
        }
        console.log(error);
    });

    mongoose.connection.once("open", () => {
        console.log(`MongoDB successfully connected to ${mongoUri}`);
    });

    // Populate database
    const games = [];
    const characters = [];
    await createCharacters();
    await createGames();

    async function newCharacter(index, name, imageUrl, _id) {
        const character = new Character({
            name: name,
            imageUrl: imageUrl,
            _id: _id,
        });
        await character.save();
        characters[index] = character;
    }

    async function newGame(
        index,
        imageUrl,
        imageWidth,
        imageHeight,
        characters
    ) {
        const game = new Game({
            imageUrl: imageUrl,
            imageWidth: imageWidth,
            imageHeight: imageHeight,
            characters: characters,
        });
        await game.save();
        games[index] = game;
    }

    async function createCharacters() {
        await Promise.all([
            newCharacter(0, "Wally", "src/assets/images/characters/wally.png"),
            newCharacter(1, "Wilma", "src/assets/images/characters/wilma.png"),
            newCharacter(2, "Woof", "src/assets/images/characters/woof.png"),
            newCharacter(
                3,
                "Wizard",
                "src/assets/images/characters/wizard.png"
            ),
            newCharacter(4, "Odlaw", "src/assets/images/characters/odlaw.png"),
        ]);
    }

    async function createGames() {
        await Promise.all([
            newGame(
                0,
                "src/assets/images/pages/book_1_in_town.png",
                1071,
                1015,
                [
                    {
                        character: characters[0], // Wally
                        positionX: 158,
                        positionY: 734,
                        width: 56,
                        height: 88,
                    },
                    {
                        character: characters[1], // Wilma
                        positionX: 168,
                        positionY: 578,
                        width: 38,
                        height: 68,
                    },
                    {
                        character: characters[2], // Woof
                        positionX: 396,
                        positionY: 267,
                        width: 30,
                        height: 24,
                    },
                    {
                        character: characters[3], // Wizard
                        positionX: 528,
                        positionY: 753,
                        width: 40,
                        height: 58,
                    },
                    {
                        character: characters[4], // Odlaw
                        positionX: 410,
                        positionY: 936,
                        width: 38,
                        height: 54,
                    },
                ]
            ),
        ]);
    }

    return [games, characters];
};

export default initialiseMongoServer;
