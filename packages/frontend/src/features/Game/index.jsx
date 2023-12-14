import { useState, useEffect, useCallback } from "react";
import styles from "./index.module.css";

import { v4 as uuidv4 } from "uuid";

import * as fetchAPI from "./utils/fetchAPI.js";
import convertTimeMillisecondsToHours from "@/utils/convertTimeMillisecondsToHours.js";

import NavigationButton from "@/features/NavBar/components/NavigationButton";
import HighScoreForm from "./components/HighScoreForm";
import TimeCounter from "./components/TimeCounter";

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
    const [charactersFound, setCharactersFound] = useState([]);
    const [selectionResponse, setSelectionResponse] = useState({
        message: "",
        success: false,
        element: null,
    });
    const [submittingHighScore, setSubmittingHighScore] = useState(false);
    const [highScoreSubmissionErrors, setHighScoreSubmissionErrors] = useState([]);
    const [highScoreSubmissionMessage, setHighScoreSubmissionMessage] = useState(null);

    const boxSizePx = [72, 72];

    const resetGame = () => {
        setGameState("waiting");
        setSubmittingHighScore(false);
        setHighScoreSubmissionErrors([]);
        setSelecting(false);
        setGameDuration(null);
        setCharactersFound([]);
        setSelectionResponse({
            message: "",
            success: false,
            element: null,
        });
    }

    const startGame = (restarting) => {
        const getGameInfo = async () => {
            const newInfo = await fetchAPI.getGameInformation(restarting);
            setGameInfo(newInfo.gameInfo);
            resetGame();
            setCharactersFound(newInfo.charactersFound);
            setGameDuration(newInfo.timeTaken);
            setGameState("started");
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
        (async () => {
            const response = await fetchAPI.postCharacterSelection(characterId, clickPosition);
            if (response) {
                setCharactersFound(response.charactersFound);
                if (response.success) {
                    setSelectionResponse({
                        message: `Well done! You found ${characterName}!`,
                        success: true,
                        element: null,
                    });
                    setGameDuration(response.timeTaken);
                } else {
                    setSelectionResponse({
                        message: `Back luck... ${characterName} isn't there!`,
                        success: false,
                        element: null,
                    });
                }
            }
            setSelecting(false);
        })();
    }

    const submitHighScore = useCallback(async (e) => {
        e.currentTarget.blur();
        e.preventDefault(); // Prevent form submission; handle manually
    
        const formData = new FormData(e.target.form);
        const formFields = Object.fromEntries(formData);

        // Client-side validation
        const errors = [];
        if (formFields.first_name.length < 1) errors.push("Please fill in the First Name field.");
        if (formFields.last_name.length < 1) errors.push("Please fill in the Last Name field.");
        if (errors.length > 0) {
            setHighScoreSubmissionErrors(errors);
            return;
        }

        const status = await fetchAPI.postHighScoreSubmission(
            formFields.first_name,
            formFields.last_name
        );
        if (status) {
            resetGame();
            setHighScoreSubmissionMessage(
                <h3
                key={uuidv4()}
                    className={styles["high-score-submission-message"]}
                    aria-label="high-score-submission-message"
                    onAnimationEnd={() => { setHighScoreSubmissionMessage(null); }}
                >Your time was submitted!</h3>
            )
        } else {
            setHighScoreSubmissionErrors(["Something went wrong. Please try again."]);
        }
    }, []);

    const isCharacterFound = (characterId) => {
        for (let i = 0; i < charactersFound.length; i++) {
            if (charactersFound[i].id === characterId) {
                return true;
            }
        }
        return false;
    }

    const isGameFinished = () => {
        for (let i = 0; i < gameInfo.characters.length; i++) {
            if (
                charactersFound.filter(
                    (c) =>
                        c.id ===
                        gameInfo.characters[i].id.toString()
                ).length === 0
            ) {
                return false;
            }
        }
        return true;
    }

    const setGameEndedState = () => {
        setGameState("ended");
        setSelectionResponse({
            message: "",
            success: false,
            element: null,
        });
    }
    if (gameState === "started" && isGameFinished()) setGameEndedState();

    const startGameButton = (text, restarting) => {
        return (
            <button
                className={styles["start-game-button"]}
                onClick={(e) => {
                    e.target.blur();
                    e.preventDefault();
                    startGame(restarting);
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
                    setSubmittingHighScore(true);
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

    const convertGameDurationToString = () => {
        const time = convertTimeMillisecondsToHours(gameDuration);
        return `${time.hours}:${time.minutes}:${time.seconds}.${time.milliseconds}`;
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
                ?   startGameButton("Start Game", false)
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
                    {charactersFound.map((c, i) => {
                        return (
                            <div
                                className={styles["successful-click-area"]}
                                key={c.id}
                                aria-label="successful-click-area"
                                style={{
                                    pointerEvents: "none",

                                    position: "absolute",
                                    left: `${Math.max(Math.min(c.position[0] - (c.width / 2), gameInfo.imageSize[0] - c.width), 0)}px`,
                                    top: `${Math.max(Math.min(c.position[1] - (c.height / 2), gameInfo.imageSize[1] - c.height), 0)}px`,
                                    
                                    width: `${c.width}px`,
                                    height: `${c.height}px`,
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
                                    if (isCharacterFound(character.id)) return null;
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
                ?   <>
                    {selectionResponse.element}
                    <div className={styles["time-counter-wrapper"]}>
                    <div className={styles["time-counter"]}>
                        <TimeCounter
                            startTime={Number.parseInt(gameDuration)}
                            counting={true}
                        />
                    </div>
                    </div>
                    </>
                :   null}
                {gameState === "ended"
                ?   <div className={styles["game-ended-display"]}>
                    {!submittingHighScore
                    ?   <div
                            className={styles["game-ended-information"]}
                            key={uuidv4()} // Trick to restart animation
                        >
                        <h1
                            className={styles["congratulations-message"]}
                            aria-label="congratulations-message"
                        >Congratulations!</h1>
                        {gameDuration
                        ?   <h3
                                className={styles["game-duration"]}
                                aria-label="game-duration"
                            >Your final time was: {convertGameDurationToString()}</h3>
                        :   null}
                        {startGameButton("Play Again", true)}
                        {submitToHighScoresButton()}
                        </div>
                    :   <div className={styles["high-score-form"]}>
                        <HighScoreForm
                            onCloseHandler={() => setSubmittingHighScore(false)}
                            onSubmitHandler={submitHighScore}
                            submissionErrors={highScoreSubmissionErrors}
                        />
                        </div>
                    }
                    </div>
                :   null}
                {highScoreSubmissionMessage}
            </div>
            <div className={styles["characters-remaining-container"]}>
                <h3
                    className={styles["characters-remaining-title"]}
                    aria-label="characters-remaining"
                >Characters Remaining</h3>
                <ul className={styles["characters-remaining-list"]}>
                    {gameInfo.characters.map((character, i) => {
                        if (isCharacterFound(character.id)) return null;
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