import styles from "./index.module.css";

import NavBar from "@/features/NavBar";

const Landing = () => {

    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <h1 className={styles["title"]} aria-label="title">Where's Wally?</h1>
            <div className={styles["nav-bar"]}>
                <NavBar
                    options={[
                        {
                            text: "Play",
                            link: "/play",
                        },
                        {
                            text: "High-Score Table",
                            link: "/high-scores",
                        },
                    ]}
                />
            </div>
            <div className={styles["introduction-paragraph-container"]}>
                <p className={styles["introduction-paragraph"]} aria-label="introduction">
                    Welcome to Where's Wally! The goal of the game is to find every
                    hidden character among an image packed full of other characters.
                </p>
                <p className={styles["introduction-paragraph"]} aria-label="introduction">
                    If you can do it quickly, you may even have a chance to have
                    your name displayed on the leaderboards!
                </p>
                <p className={styles["introduction-paragraph"]} aria-label="introduction">
                    Press 'Play' above to get started.
                </p>
            </div>
        </div>
        </div>
    )
}

export default Landing;