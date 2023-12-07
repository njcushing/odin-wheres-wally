import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./index.module.css";

import getHighScores from "./utils/getHighScores";
import convertTimeSecondsToHours from "@/utils/convertTimeSecondsToHours";

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
                {highScoreList.map((score, i) => {
                    let position = "";
                    if (i === 0) position = "-gold";
                    if (i === 1) position = "-silver";
                    if (i === 2) position = "-bronze";
                    let time = convertTimeSecondsToHours(score.time);
                    return (
                        <li
                            className={styles[`high-score${position}`]}
                            aria-label="high-score"
                            key={i}
                        >
                            <h2
                                className={styles["high-score-information"]}
                                aria-label="high-score-information"
                            >{`${i + 1}: ${score.firstName} ${score.lastName} ${time.hours}:${time.minutes}:${time.seconds}`}</h2>
                        </li>
                    );
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
    )
}

export default HighScores;