import { useState, useEffect } from "react";
import styles from "./index.module.css";

import * as fetchAPI from "./utils/fetchAPI.js";

const Game = () => {
    const [gameStarted, setGameStarted] = useState(false);
    const [characters, setCharacters] = useState([]);
    const [gameImage, setGameImage] = useState("");
    const [selecting, setSelecting] = useState(false);
    const [clickPosition, setClickPosition] = useState([0, 0]);

    const boxSizePx = [72, 72];

    useEffect(() => {
        const characters = fetchAPI.fetchCharacters();
        setCharacters(characters);
    }, []);

    const clickedImage = (e) => {
        const rect = e.target.getBoundingClientRect();
        const clickPos = [e.clientX - rect.left, e.clientY - rect.top];
        setSelecting(!selecting);
        setClickPosition(clickPos);
    }

    const clickedSelectionBox = () => {
        return;
    }

    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <div className={styles["image-container"]}>
                {gameStarted
                ?   <>
                    <img
                        className={styles["game-image"]}
                        src={gameImage}
                        alt="Image containing the characters to locate."
                        onClick={clickedImage}
                    ></img>
                    {selecting
                    ?   <div
                            className={styles["selection-box"]}
                            aria-label="selection-area"
                            onClick={clickedSelectionBox}
                            style={{
                                position: "absolute",
                                left: `${Math.max(clickPosition[0] - (boxSizePx[0] / 2), 0)}px`,
                                top: `${Math.max(clickPosition[1] - (boxSizePx[1] / 2), 0)}px`,

                                width: `${boxSizePx[0]}px`,
                                height: `${boxSizePx[1]}px`,
                            }}
                        ></div>
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
                    {characters.map((character, i) => {
                        return (
                            <li
                                className={styles["character"]}
                                aria-label="character"
                                key={i}
                            >{i}</li>
                        )
                    })}
                </ul>
            </div>
        </div>
        </div>
    );
};

export default Game;