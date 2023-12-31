import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import styles from "./index.module.css";

import { DateTime } from "luxon";
import getHighScores from "./utils/getHighScores";
import convertTimeMillisecondsToHours from "@/utils/convertTimeMillisecondsToHours";

import NavigationButton from "@/features/NavBar/components/NavigationButton";

var isDate = function(date) {
    return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
}

const formatDate = (dateString) => {
    if (dateString && isDate(dateString)) {
        return DateTime.fromJSDate(new Date(dateString)).toLocaleString(
            DateTime.DATETIME_SHORT_WITH_SECONDS
        );
    }
    return "Unknown";
}

const HighScores = () => {
    const { gameId } = useParams();

    const [highScoreList, setHighScoreList] = useState([]);

    useEffect(() => {
        (async () => {
            const highScoreListNew = await getHighScores(gameId);
            setHighScoreList(highScoreListNew);
        })();
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
                {highScoreList.length > 0
                ?   highScoreList.map((score, i) => {
                        let position = "";
                        if (i === 0) position = "-gold";
                        if (i === 1) position = "-silver";
                        if (i === 2) position = "-bronze";
                        let time = convertTimeMillisecondsToHours(score.time);
                        return (
                            <li
                                className={styles[`high-score${position}`]}
                                aria-label="high-score"
                                key={i}
                            >
                                <h2
                                    className={styles["high-score-information"]}
                                    aria-label="high-score-information"
                                >{`${i + 1}: ${score.first_name} ${score.last_name} ${time.hours}:${time.minutes}:${time.seconds}.${time.milliseconds}`}</h2>
                                <h3
                                    className={styles["high-score-date-achieved"]}
                                >Date achieved: {formatDate(score.date_achieved)}</h3>
                            </li>
                        );
                    })
                :   <h3
                        className={styles["no-high-scores-found-message"]}
                    >This game doesn't have any recorded times yet!</h3>}
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