import { useState, useEffect } from "react";
import styles from "./index.module.css";

import * as fetchAPI from "./utils/fetchAPI.js";

import NavigationButton from "@/features/NavBar/components/NavigationButton";

const Game = () => {
    const [gameState, setGameState] = useState("waiting");
    const [gameInfo, setGameInfo] = useState({
        image: null,
        imageSize: [800, 800],
        characters: []
    });
    const [gameDuration, setGameDuration] = useState(null);
    const [selecting, setSelecting] = useState(false);
    const [clickPosition, setClickPosition] = useState([0, 0]);
    const [successfulClicks, setSuccessfulClicks] = useState([]);
    const [selectionResponseMessage, setSelectionResponseMessage] = useState({
        message: "",
        success: false,
    });

    const boxSizePx = [72, 72];

    const startGame = () => {
        const getGameInfo = async () => {
            const newInfo = await fetchAPI.getGameInformation();
            setGameInfo({
                image: newInfo.image,
                imageSize: newInfo.imageSize,
                characters: newInfo.characters,
            });
            setGameState("started");
            setGameDuration(null);
            setSuccessfulClicks([]);
        }
        getGameInfo();
    }

    const clickedImage = (e) => {
        if (gameState === "started") {
            const rect = e.target.getBoundingClientRect();
            const clickPos = [e.clientX - rect.left, e.clientY - rect.top];
            setSelecting(!selecting);
            setClickPosition(clickPos);
        }
    }

    const characterSelected = (characterName, clickPosition) => {
        const selectionResult = fetchAPI.postCharacterSelection(characterName, clickPosition);
        if (selectionResult) {
            const charactersNew = gameInfo.characters.filter((character) => character.name != characterName)
            setGameInfo({
                ...gameInfo,
                characters: charactersNew,
            });
            setSuccessfulClicks([
                ...successfulClicks,
                clickPosition
            ]);
            if (charactersNew.length === 0) {
                const duration = fetchAPI.getGameDuration();
                setGameState("ended");
                setGameDuration(duration);
            } else {
                setSelectionResponseMessage({
                    message: `Well done! You found ${characterName}!`,
                    success: true,
                });
            }
        } else {
            setSelectionResponseMessage({
                message: `Back luck... ${characterName} isn't there!`,
                success: false,
            });
        }
        setSelecting(false);
    }

    const startGameButton = (text) => {
        return (
            <button
                className={styles["start-game-button"]}
                onClick={(e) => {
                    e.target.blur();
                    e.preventDefault();
                    startGame();
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.blur();
                }}
            >{text}</button>
        );
    }

    const submitToHighScoresButton = () => {
        return (
            <button
                className={styles["submit-to-high-scores-button"]}
                onClick={(e) => {
                    e.target.blur();
                    e.preventDefault();
                    fetchAPI.postHighScoreSubmission();
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.blur();
                }}
            >Submit to High-Scores</button>
        );
    }

    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <div
                className={styles["image-container"]}
                style={{
                    position: "relative",

                    width: `${gameInfo.imageSize[0]}px`,
                    height: `${gameInfo.imageSize[1]}px`,
                }}
            >
                {gameState === "waiting"
                ?   startGameButton("Start Game")
                :   null}
                {gameState === "started" || gameState === "ended"
                ?   <>
                    <img
                        className={styles["game-image"]}
                        src={gameInfo.image}
                        alt="Image containing the characters to locate."
                        onClick={clickedImage}
                        style={{
                            width: `100%`,
                            height: `100%`,
                        }}
                    ></img>
                    {selecting
                    ?   <div
                            className={styles["selection-box"]}
                            aria-label="selection-area"
                            style={{
                                position: "absolute",
                                left: `${Math.max(Math.min(clickPosition[0] - (boxSizePx[0] / 2), gameInfo.imageSize[0] - boxSizePx[0]), 0)}px`,
                                top: `${Math.max(Math.min(clickPosition[1] - (boxSizePx[1] / 2), gameInfo.imageSize[1] - boxSizePx[1]), 0)}px`,

                                width: `${boxSizePx[0]}px`,
                                height: `${boxSizePx[1]}px`,
                            }}
                        >
                            <ul
                                className={styles["character-selection-box"]}
                                aria-label="character-selection-box"
                                style={{
                                    position: "absolute",
                                    left: `${boxSizePx[0] + 10}px`
                                }}
                            >
                                {gameInfo.characters.map((character, i) => {
                                    return(
                                        <li
                                            className={styles["character-selection-option"]}
                                            aria-label="character-selection-option"
                                            onClick={(e) => {
                                                e.target.blur();
                                                e.preventDefault();
                                                characterSelected(character.name, clickPosition);
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.blur();
                                            }}
                                            key={i}
                                            tabIndex={0}
                                        >
                                            {character.name}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    :   null}
                    {successfulClicks.map((clickPosition, i) => {
                        return (
                            <div
                                className={styles["successful-click-area"]}
                                key={i}
                                aria-label="successful-click-area"
                                style={{
                                    position: "absolute",
                                    left: `${Math.max(Math.min(clickPosition[0] - (boxSizePx[0] / 2), gameInfo.imageSize[0] - boxSizePx[0]), 0)}px`,
                                    top: `${Math.max(Math.min(clickPosition[1] - (boxSizePx[1] / 2), gameInfo.imageSize[1] - boxSizePx[1]), 0)}px`,
    
                                    width: `${boxSizePx[0]}px`,
                                    height: `${boxSizePx[1]}px`,
                                }}
                            ></div>
                        );
                    })}
                    </>
                :   null}
                {gameState === "started" && selectionResponseMessage.message !== ""
                ?   <h3
                        className={styles["selection-response-message"]}
                        aria-label="selection-response-message"
                        onAnimationEnd={() => { setSelectionResponseMessage({
                            message: "",
                            success: false,
                        }) }}
                        style={{
                            color: selectionResponseMessage.success
                                ? "rgba(23, 194, 1, 0.92)"
                                : "rgba(228, 27, 0, 0.92)"
                        }}
                    >{selectionResponseMessage.message}</h3>
                :   null}
                {gameState === "ended"
                ?   <div className={styles["game-ended-display"]}>
                    <h1
                        className={styles["congratulations-message"]}
                        aria-label="congratulations-message"
                    >Congratulations!</h1>
                    {gameDuration
                    ?   <h3
                            className={styles["game-duration"]}
                            aria-label="game-duration"
                        >Your final time was: {gameDuration}</h3>
                    :   null}
                    {startGameButton("Play Again")}
                    {submitToHighScoresButton()}
                    </div>
                :   null}
            </div>
            <div className={styles["characters-remaining-container"]}>
                <h3
                    className={styles["characters-remaining-title"]}
                    aria-label="characters-remaining"
                >Characters Remaining</h3>
                <ul className={styles["characters-remaining-list"]}>
                    {gameInfo.characters.map((character, i) => {
                        return (
                            <li
                                className={styles["character-remaining"]}
                                aria-label="character-remaining"
                                key={i}
                            >
                                <img
                                    className={styles["character-image"]}
                                    aria-label="character-image"
                                    src={character.imageUrl}
                                    alt={character.name}
                                ></img>   
                            {character.name}</li>
                        )
                    })}
                </ul>
            </div>
            <div className={styles["navigation-button"]}>
                <NavigationButton
                    link="/"
                    text="Return to Home"
                />
            </div>
        </div>
        </div>
    );
};

export default Game;