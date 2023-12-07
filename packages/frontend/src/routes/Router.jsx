import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Landing from "@/pages/Landing";
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
            path: "/play",
            element: <Play />,
            errorElement: <ErrorPage />,
        },
        {
            path: "/high-scores",
            element: <HighScores />,
            errorElement: <ErrorPage />,
        },
    ]);

    return (
        <RouterProvider router={browserRouter} />
    )
}

export default Router;