import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./index.module.css";

import getHighScores from "./utils/getHighScores";

import NavigationButton from "@/features/NavBar/components/NavigationButton";

const HighScores = () => {
    const [highScoreList, setHighScoreList] = useState([]);

    useEffect(() => {
        const highScoreListNew = getHighScores();
        setHighScoreList(highScoreListNew);
    }, []);

    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <h1 className={styles["high-scores-title"]} aria-label="high-scores-title">
                High-Scores:
            </h1>
            <ul
                className={styles["high-scores-list"]}
                aria-label="high-scores-list"
            >
                
            </ul>
            <div className={styles["navigation-button"]}>
                <NavigationButton
                    link="/"
                    text="Return to Home"
                />
            </div>
        </div>
        </div>
    )
}

export default HighScores;