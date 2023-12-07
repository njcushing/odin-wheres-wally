import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
    res.send("Request successful");
});

export { router as index };
