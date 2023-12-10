import express from "express";
const router = express.Router();

import game from "./game.js";
import highscore from "./highscore.js";

router.get("/", (req, res) => {
    res.send("");
});

export { router as index, game, highscore };
