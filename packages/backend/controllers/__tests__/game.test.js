import request from "supertest";
import express from "express";
const app = express();
import game from "../../routes/game.js";

import mongoose from "mongoose";
import initialiseMongoServer from "../../utils/dbConfigTesting.js";

app.use(express.urlencoded({ extended: false }));
app.use("/", game);

beforeAll(async () => {
    await initialiseMongoServer();
});

describe("Route testing...", () => {
    describe("/game/:gameId GET route...", () => {
        test(`Should return status code 400 if provided gameId is not a valid
         MongoDB ObjectId`, async (done) => {
            const gameId = null;
            await request(app).get(`/${gameId}`).expect(400);
        });
        test(`Should return status code 404 if provided gameId is a valid
         MongoDB ObjectId, but the document is not found in the database`, async (done) => {
            const gameId = new mongoose.Types.ObjectId();
            await request(app).get(`/${gameId}`).expect(404);
        });
    });
});
