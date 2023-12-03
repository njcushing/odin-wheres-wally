import styles from "./index.module.css";

import Game from "@/features/Game";
import NavigationButton from "@/features/NavBar/components/NavigationButton";

const Play = () => {
    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <div className={styles["game-container"]}>
                <Game />
            </div>
            <div className={styles["navigation-button"]}>
                <NavigationButton
                    link="/"
                    text="Return to Home"
                />
            </div>
        </div>
        </div>
    )
};

export default Play;