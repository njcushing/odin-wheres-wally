import express from "express";
const router = express.Router();

import * as controller from "../controllers/characterController.js";

router.post(
    "/:gameId/character/:characterId/check-position",
    controller.characterCheckPosition
);

export default router;
