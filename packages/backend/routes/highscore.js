import express from "express";
const router = express.Router();

import * as controller from "../controllers/highscoreController.js";

router.get("/:gameId/high-scores", controller.highscoreGet);
router.post("/:gameId/high-scores", controller.highscorePost);

export default router;
