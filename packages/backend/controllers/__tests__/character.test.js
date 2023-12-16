import request from "supertest";
import express from "express";
const app = express();
import passport from "passport";
import passportJWT from "passport-jwt";
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
import { vi } from "vitest";
import character from "../../routes/character.js";

import mongoose from "mongoose";
import initialiseMongoServer from "../../utils/dbConfigTesting.js";

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", character);

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

const checkTokenState = vi.fn(() => {
    return [
        {
            id: new mongoose.Types.ObjectId(),
            dateStarted: Date.now(),
            timeTaken: null,
            gameId: games[0]._id,
            charactersFound: [],
        },
        true,
    ];
});
vi.mock("../../utils/checkTokenState", async () => ({
    default: () => checkTokenState(),
}));

const checkGameWon = vi.fn(() => false);
vi.mock("../../utils/checkGameWon", async () => ({
    default: () => checkGameWon(),
}));

let games, highscores, characters;
beforeAll(async () => {
    [games, highscores, characters] = await initialiseMongoServer();
});

afterAll(() => {
    mongoose.connection.close();
});

describe("Route testing...", () => {
    describe("/game/:gameId/character/:characterId/check-position POST route...", () => {
        test(`Should return status code 400 if provided gameId is not a valid
         MongoDB ObjectId`, async () => {
            const gameId = null;
            const characterId = characters[0]._id;
            await request(app)
                .post(`/${gameId}/character/${characterId}/check-position`)
                .expect(400);
        });
        test(`Should return status code 404 if provided gameId is a valid
         MongoDB ObjectId, but the document is not found in the database`, async () => {
            const gameId = new mongoose.Types.ObjectId();
            const characterId = characters[0]._id;
            await request(app)
                .post(`/${gameId}/character/${characterId}/check-position`)
                .expect(404);
        });
        test(`Should return status code 400 if provided characterId is not a
         valid MongoDB ObjectId`, async () => {
            const gameId = games[0]._id;
            const characterId = null;
            await request(app)
                .post(`/${gameId}/character/${characterId}/check-position`)
                .expect(400);
        });
        test(`Should return status code 404 if provided characterId is a valid
         MongoDB ObjectId, but the document is not found in the database`, async () => {
            const gameId = games[0]._id;
            const characterId = new mongoose.Types.ObjectId();
            await request(app)
                .post(`/${gameId}/character/${characterId}/check-position`)
                .expect(404);
        });
        test(`Should return status code 404 if provided characterId is a valid
         MongoDB ObjectId, but the document is not found in the database`, async () => {
            const gameId = games[0]._id;
            const characterId = characters[5]._id;
            await request(app)
                .post(`/${gameId}/character/${characterId}/check-position`)
                .expect(404);
        });
        test(`Should return status code 400 if the body object in the request
         object does not contain the necessary information`, async () => {
            const gameId = games[0]._id;
            const characterId = characters[0]._id;
            await request(app)
                .post(`/${gameId}/character/${characterId}/check-position`)
                .send()
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should return status code 400 if the specified character has
         already been found in the current game`, async () => {
            const gameId = games[0]._id;
            const characterId = characters[0]._id;
            checkTokenState.mockReturnValueOnce([
                {
                    id: new mongoose.Types.ObjectId(),
                    dateStarted: Date.now(),
                    timeTaken: null,
                    gameId: games[0]._id,
                    charactersFound: [
                        {
                            id: characters[0]._id.toString(),
                            position: [
                                games[0].characters[0].positionX,
                                games[0].characters[0].positionY,
                            ],
                            width: games[0].characters[0].width,
                            height: games[0].characters[0].height,
                        },
                    ], // Mocking character found
                },
                true,
            ]);
            await request(app)
                .post(`/${gameId}/character/${characterId}/check-position`)
                .send({ click_position: [0, 0] })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should return status code 200 if all previous checks pass`, async () => {
            const gameId = games[0]._id;
            const characterId = characters[0]._id;
            await request(app)
                .post(`/${gameId}/character/${characterId}/check-position`)
                .send({
                    click_position: [
                        games[0].characters[0].positionX,
                        games[0].characters[0].positionY,
                    ],
                })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(200);
        });
        test(`If status code is 200, res.body.data.selectionResponse.success
         should be false if if the selected character was not within the bounds
         of the specified click position`, async () => {
            const gameId = games[0]._id;
            const characterId = characters[0]._id;
            await request(app)
                .post(`/${gameId}/character/${characterId}/check-position`)
                .send({ click_position: [-1000, -1000] })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect((res) => {
                    const data = res.body.data;
                    if (data.selectionResponse.success) {
                        throw new Error(
                            `res.body.data.selectionResponse.success was true, should have been false`
                        );
                    }
                });
        });
        test(`If status code is 200, res.body.data.selectionResponse.success
         should be true if if the selected character was within the bounds of
         the specified click position`, async () => {
            const gameId = games[0]._id;
            const characterId = characters[0]._id;
            await request(app)
                .post(`/${gameId}/character/${characterId}/check-position`)
                .send({
                    click_position: [
                        games[0].characters[0].positionX,
                        games[0].characters[0].positionY,
                    ],
                })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect((res) => {
                    const data = res.body.data;
                    if (!data.selectionResponse.success) {
                        throw new Error(
                            `res.body.data.selectionResponse.success was false, should have been true`
                        );
                    }
                });
        });
        test(`If status code is 200 and the selection was successful,
         res.body.data.selectionResponse.charactersFound should contain the
         specified character's information`, async () => {
            const gameId = games[0]._id;
            const characterId = characters[0]._id;
            await request(app)
                .post(`/${gameId}/character/${characterId}/check-position`)
                .send({
                    click_position: [
                        games[0].characters[0].positionX,
                        games[0].characters[0].positionY,
                    ],
                })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect((res) => {
                    const data = res.body.data;
                    if (data.selectionResponse.charactersFound.length !== 1) {
                        throw new Error(
                            `res.body.data.selectionResponse.charactersFound is length ${data.selectionResponse.charactersFound.length}, should be 1`
                        );
                    }
                });
        });
        test(`If status code is 200 res.body.data.selectionResponse.timeTaken
         should be updated to the current time`, async () => {
            const gameId = games[0]._id;
            const characterId = characters[0]._id;
            await request(app)
                .post(`/${gameId}/character/${characterId}/check-position`)
                .send({
                    click_position: [
                        games[0].characters[0].positionX,
                        games[0].characters[0].positionY,
                    ],
                })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect((res) => {
                    const data = res.body.data;
                    if (
                        Number.isNaN(
                            Number.parseInt(data.selectionResponse.timeTaken)
                        )
                    ) {
                        throw new Error(
                            `res.body.data.selectionResponse.timeTaken not a valid numeric value: ${data.selectionResponse.timeTaken}`
                        );
                    }
                });
        });
    });
});
