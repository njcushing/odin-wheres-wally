import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Landing from "@/pages/Landing";
import GameSelection from "@/pages/GameSelection";
import Play from "@/pages/Play";
import HighScores from "@/pages/HighScores";

import ErrorPage from "@/pages/ErrorPage";

const Router = () => {
    const browserRouter = createBrowserRouter([
        {
            path: "/",
            element: <Landing />,
            errorElement: <ErrorPage />,
        },
        {
            path: "/play/:gameId",
            element: <Play />,
            errorElement: <ErrorPage />,
        },
        {
            path: "/play",
            element: <GameSelection />,
            errorElement: <ErrorPage />,
        },
        {
            path: "/high-scores/:gameId",
            element: <HighScores />,
            errorElement: <ErrorPage />,
        },
        {
            path: "/high-scores",
            element: <GameSelection />,
            errorElement: <ErrorPage />,
        },
    ]);

    return (
        <RouterProvider router={browserRouter} />
    )
}

export default Router;