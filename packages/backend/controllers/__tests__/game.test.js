import request from "supertest";
import express from "express";
const app = express();
import passport from "passport";
import passportJWT from "passport-jwt";
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
import { vi } from "vitest";
import game from "../../routes/game.js";

import mongoose from "mongoose";
import initialiseMongoServer from "../../utils/dbConfigTesting.js";

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", game);

// Verify token
passport.use(
    "jwt",
    new JWTStrategy(
        {
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey: "test",
        },
        (jwt_payload, done) => {
            return done(null, jwt_payload);
        }
    )
);

let games, characters, highscores;
beforeAll(async () => {
    [games, characters, highscores] = await initialiseMongoServer();
});

afterAll(() => {
    mongoose.connection.close();
});

describe("Route testing...", () => {
    describe("/game/:gameId GET route...", () => {
        test(`Should return status code 200`, async () => {
            await request(app).get("").expect(200);
        });
    });
    describe("/game/:gameId GET route...", () => {
        test(`Should return status code 400 if provided gameId is not a valid
         MongoDB ObjectId`, async () => {
            const gameId = null;
            await request(app).get(`/${gameId}`).expect(400);
        });
        test(`Should return status code 404 if provided gameId is a valid
         MongoDB ObjectId, but the document is not found in the database`, async () => {
            const gameId = new mongoose.Types.ObjectId();
            await request(app).get(`/${gameId}`).expect(404);
        });
        test(`Should return status code 200 if the specified game is found in
         the database and the token is created`, async () => {
            const gameId = games[0]._id;
            await request(app).get(`/${gameId}`).expect(200);
        });
        test(`Should also return gameInfo, charactersFound, timeTaken and token
         on success within response body.data`, async () => {
            const gameId = games[0]._id;
            await request(app)
                .get(`/${gameId}`)
                .expect((res) => {
                    const data = res.body.data;
                    if (typeof data !== "object") {
                        throw new Error(
                            `res.body.data was expected to be type 'object', got '${typeof res
                                .body.data}'`
                        );
                    }
                    if (typeof data.gameInfo !== "object") {
                        throw new Error(
                            `res.body.data.gameInfo was expected to be type 'object', got '${typeof res
                                .body.data.gameInfo}'`
                        );
                    }
                    if (
                        data.gameInfo.imageUrl !==
                        "src/assets/images/pages/book_1_in_town.png"
                    ) {
                        throw new Error(
                            `res.body.data.gameInfo.imageUrl was given incorrect data: ${data.gameInfo.imageUrl}, expected "src/assets/images/pages/book_1_in_town.png"`
                        );
                    }
                    if (data.gameInfo.imageWidth !== 1071) {
                        throw new Error(
                            `res.body.data.gameInfo.imageWidth was given incorrect data: ${data.gameInfo.imageWidth}, expected 1071`
                        );
                    }
                    if (data.gameInfo.imageHeight !== 1015) {
                        throw new Error(
                            `res.body.data.gameInfo.imageHeight was given incorrect data: ${data.gameInfo.imageHeight}, expected 1071`
                        );
                    }
                    if (data.gameInfo.characters.length !== 5) {
                        throw new Error(
                            `res.body.data.gameInfo.characters array is the wrong length: ${data.gameInfo.characters.length}, expected 5`
                        );
                    }
                    if (data.charactersFound.length !== 0) {
                        throw new Error(
                            `res.body.data.charactersFound array is the wrong length: ${data.charactersFound.length}, expected 0`
                        );
                    }
                    if (data.timeTaken !== 0) {
                        throw new Error(
                            `res.body.data.timeTaken was given incorrect data: ${data.timeTaken}, expected 0`
                        );
                    }
                    if (!Object(data).hasOwnProperty("token")) {
                        throw new Error(
                            `res.body.data.token not found on data object in response object`
                        );
                    }
                });
        });
    });
});
