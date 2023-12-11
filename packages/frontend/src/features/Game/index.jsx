import { useState, useEffect } from "react";
import styles from "./index.module.css";

import { v4 as uuidv4 } from "uuid";

import * as fetchAPI from "./utils/fetchAPI.js";

import NavigationButton from "@/features/NavBar/components/NavigationButton";

const Game = () => {
    const [gameState, setGameState] = useState("waiting");
    const [gameInfo, setGameInfo] = useState({
        imageUrl: null,
        imageSize: [800, 800],
        characters: []
    });
    const [gameDuration, setGameDuration] = useState(null);
    const [selecting, setSelecting] = useState(false);
    const [clickPosition, setClickPosition] = useState([0, 0]);
    const [successfulClicks, setSuccessfulClicks] = useState([]);
    const [selectionResponse, setSelectionResponse] = useState({
        message: "",
        success: false,
        element: null,
    });

    const boxSizePx = [72, 72];

    const startGame = () => {
        const getGameInfo = async () => {
            const newInfo = await fetchAPI.getGameInformation();
            setGameInfo({
                imageUrl: newInfo.imageUrl,
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

    const characterSelected = (characterId, characterName, clickPosition) => {
        const getSelectionResult = async () => {
            const selectionResult = await fetchAPI.postCharacterSelection(characterId, clickPosition);
            if (selectionResult) {
                if (selectionResult.success) {
                    const charactersNew = gameInfo.characters.filter((character) => character.id != characterId)
                    setGameInfo({
                        ...gameInfo,
                        characters: charactersNew,
                    });
                    setSuccessfulClicks([
                        ...successfulClicks,
                        [
                            selectionResult.position,
                            selectionResult.width,
                            selectionResult.height,
                        ]
                    ]);
                    if (charactersNew.length === 0) {
                        const duration = fetchAPI.getGameDuration();
                        setGameState("ended");
                        setGameDuration(duration);
                        setSelectionResponse({
                            message: "",
                            success: false,
                            element: null,
                        })
                    } else {
                        setSelectionResponse({
                            message: `Well done! You found ${characterName}!`,
                            success: true,
                            element: null,
                        });
                    }
                } else {
                    setSelectionResponse({
                        message: `Back luck... ${characterName} isn't there!`,
                        success: false,
                        element: null,
                    });
                }
            }
            setSelecting(false);
        }
        getSelectionResult();
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

    if (selectionResponse.message !== "" && selectionResponse.element === null) {
        setSelectionResponse({
            ...selectionResponse,
            element:
            <h3
                key={uuidv4()}
                className={styles["selection-response-message"]}
                aria-label="selection-response-message"
                onAnimationEnd={() => { setSelectionResponse({
                    message: "",
                    success: false,
                    element: null,
                }) }}
                style={{
                    color: selectionResponse.success
                        ? "rgba(23, 194, 1, 0.92)"
                        : "rgba(228, 27, 0, 0.92)"
                }}
            >{selectionResponse.message}</h3>
        });
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
                        src={gameInfo.imageUrl}
                        alt="Image containing the characters to locate."
                        onClick={clickedImage}
                        style={{
                            width: `100%`,
                            height: `100%`,
                        }}
                    ></img>
                    {successfulClicks.map((click, i) => {
                        return (
                            <div
                                className={styles["successful-click-area"]}
                                key={i}
                                aria-label="successful-click-area"
                                style={{
                                    pointerEvents: "none",

                                    position: "absolute",
                                    left: `${Math.max(Math.min(click[0][0] - (click[1] / 2), gameInfo.imageSize[0] - click[1]), 0)}px`,
                                    top: `${Math.max(Math.min(click[0][1] - (click[2] / 2), gameInfo.imageSize[1] - click[2]), 0)}px`,
                                    
                                    width: `${click[1]}px`,
                                    height: `${click[2]}px`,
                                }}
                            ></div>
                        );
                    })}
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
                                                characterSelected(character.id, character.name, clickPosition);
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
                    </>
                :   null}
                {gameState === "started"
                ?   selectionResponse.element
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