import { useState, useEffect } from "react";
import styles from "./index.module.css";

import * as fetchAPI from "./utils/fetchAPI.js";

const Game = () => {
    const [characters, setCharacters] = useState([]);

    useEffect(() => {
        const characters = fetchAPI.fetchCharacters();
        setCharacters(characters);
    }, []);

    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <div className={styles["image-container"]}>
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