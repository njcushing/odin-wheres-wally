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
        </div>
        </div>
    )
}

export default Landing;