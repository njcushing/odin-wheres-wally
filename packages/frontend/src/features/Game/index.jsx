import { useState, useEffect } from "react";
import styles from "./index.module.css";

import * as fetchAPI from "./utils/fetchAPI.js";

import NavigationButton from "@/features/NavBar/components/NavigationButton";

const Game = () => {
    const [gameStarted, setGameStarted] = useState(false);
    const [gameInfo, setGameInfo] = useState({
        image: null,
        imageSize: [800, 800],
        characters: []
    });
    const [selecting, setSelecting] = useState(false);
    const [clickPosition, setClickPosition] = useState([0, 0]);

    const boxSizePx = [72, 72];

    useEffect(() => {
        const newInfo = fetchAPI.getGameInformation();
        setGameInfo({
            image: newInfo.image,
            imageSize: newInfo.imageSize,
            characters: newInfo.characters,
        });
    }, []);

    const clickedImage = (e) => {
        const rect = e.target.getBoundingClientRect();
        const clickPos = [e.clientX - rect.left, e.clientY - rect.top];
        setSelecting(!selecting);
        setClickPosition(clickPos);
    }

    const characterSelected = (characterName, clickPosition) => {
        const selectionResult = fetchAPI.postCharacterSelection(characterName, clickPosition);
        if (selectionResult) {
            setGameInfo({
                ...gameInfo,
                characters: gameInfo.characters.filter((character) => character != characterName),
            })
        }
        setSelecting(false);
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
                {gameStarted
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
                                                characterSelected(gameInfo.characters[i], clickPosition);
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.blur();
                                            }}
                                            key={i}
                                            tabIndex={0}
                                        >
                                            {character}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    :   null}
                    </>
                :   <button
                        className={styles["start-game-button"]}
                        onClick={(e) => {
                            e.target.blur();
                            e.preventDefault();
                            setGameStarted(true);
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.blur();
                        }}
                    >Start Game</button>
                }
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
                            >{character}</li>
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