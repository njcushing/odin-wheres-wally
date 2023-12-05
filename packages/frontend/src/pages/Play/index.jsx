import styles from "./index.module.css";

import Game from "@/features/Game";

const Play = () => {
    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <div className={styles["game-container"]}>
                <Game />
            </div>
        </div>
        </div>
    )
};

export default Play;