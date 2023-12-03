import styles from "./index.module.css";

const Game = () => {
    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <div className={styles["image-container"]}>
            </div>
            <div className={styles["characters-found-container"]}>
            </div>
        </div>
        </div>
    );
};

export default Game;