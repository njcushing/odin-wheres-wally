import { useState, useEffect } from "react";
import styles from "./index.module.css";

import getGames from "./utils/getGames.js";

import NavigationButton from "@/features/NavBar/components/NavigationButton";

const GameSelection = () => {
    const [games, setGames] = useState([]);

    useEffect(() => {
        (async () => {
            const games = await getGames();
            setGames(games);
        })();
    }, []);

    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <h1 className={styles["game-selection-title"]} aria-label="game-selection-title">
                Please select one of the following games:
            </h1>
            <ul
                className={styles["game-selection-list"]}
                aria-label="game-selection-list"
            >
                {games.map((game, i) => {
                    return (
                        <li
                            className={styles["game-selection-item"]}
                            aria-label="game-selection-item"
                            key={i}
                        >
                            <div className={styles["navigation-button"]}>
                                <NavigationButton
                                    link={`${game._id}`}
                                    text={game.name}
                                />
                            </div>
                        </li>
                    )
                })}
            </ul>
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

export default GameSelection;