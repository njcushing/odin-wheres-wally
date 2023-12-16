import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import Game from "../models/game.js";
import HighScore from "../models/highscore.js";
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
    const highscores = [];
    const characters = [];
    await createCharacters();
    await createHighScores();
    await createGames();

    async function newCharacter(index, name, imageUrl) {
        const character = new Character({
            name: name,
            imageUrl: imageUrl,
        });
        await character.save();
        characters[index] = character;
    }

    async function newHighScore(
        index,
        firstName,
        lastName,
        time,
        dateAchieved
    ) {
        const highscore = new HighScore({
            first_name: firstName,
            last_name: lastName,
            time: time,
            date_achieved: dateAchieved,
        });
        await highscore.save();
        highscores[index] = highscore;
    }

    async function newGame(
        index,
        imageUrl,
        imageWidth,
        imageHeight,
        characters,
        highscores
    ) {
        const game = new Game({
            imageUrl: imageUrl,
            imageWidth: imageWidth,
            imageHeight: imageHeight,
            characters: characters,
            highscores: highscores,
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
            newCharacter(5, "Test", ""), // Character not in scene
        ]);
    }

    async function createHighScores() {
        await Promise.all([
            newHighScore(0, "John", "Smith", 200, Date.now()),
            newHighScore(1, "Davey", "Jones", 418, Date.now()),
            newHighScore(2, "William", "Turner", 140, Date.now()),
            newHighScore(3, "Elizabeth", "Swann", 192, Date.now()),
            newHighScore(4, "Jack", "Sparrow", 346, Date.now()),
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
                ],
                [
                    highscores[0]._id,
                    highscores[1]._id,
                    highscores[2]._id,
                    highscores[3]._id,
                    highscores[4]._id,
                ]
            ),
        ]);
    }

    return [games, highscores, characters];
};

export default initialiseMongoServer;
