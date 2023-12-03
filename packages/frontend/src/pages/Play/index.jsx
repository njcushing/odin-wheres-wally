import styles from "./index.module.css";

const Play = () => {
    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <div className={styles["game-container"]}>
                <div className={styles["image-container"]}>
                </div>
                <div className={styles["characters-found-container"]}>
                </div>
            </div>
        </div>
        </div>
    )
};

export default Play;