import express from "express";
const router = express.Router();

import game from "./game.js";
import character from "./character.js";
import highscore from "./highscore.js";

router.get("/", (req, res) => {
    res.send("");
});

export { router as index, game, character, highscore };
