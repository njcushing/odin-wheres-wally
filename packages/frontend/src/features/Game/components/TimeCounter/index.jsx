import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./index.module.css";

import convertTimeMillisecondsToHours from "@/utils/convertTimeMillisecondsToHours.js";

const TimeCounter = ({
    startTime,
    counting,
}) => {
    const [timeMounted, setTimeMounted] = useState(Date.now());
    const [elapsedTime, setElapsedTime] = useState(startTime);
    const [intervalId, setIntervalId] = useState(null);

    useEffect(() => {
        clearInterval(intervalId);
        setTimeMounted(Date.now());
        return () => {
            clearInterval(intervalId);
        }
    }, [startTime, counting]);

    useEffect(() => {
        if (counting) {
            const id = setInterval(() => {
                setElapsedTime(Number.parseInt(
                    (Date.now() - timeMounted) + startTime
                ));
            }, 16);
            setIntervalId(id);
        } else {
            setIntervalId(null);
        }
    }, [timeMounted]);

    const time = convertTimeMillisecondsToHours(elapsedTime);

    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <h4
                className={styles["elapsed-time"]}
                aria-label="elapsed-time"
            >
                {`${time.hours}:${time.minutes}:${time.seconds}.${time.milliseconds}`}
            </h4>
        </div>
        </div>
    );
};

TimeCounter.propTypes = {
    startTime: PropTypes.number,
    counting: PropTypes.bool.isRequired,
}

TimeCounter.defaultProps = {
    startTime: 0,
}

export default TimeCounter;