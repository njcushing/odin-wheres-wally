import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Landing from "@/pages/Landing";
import Play from "@/pages/Play";

import Error from "@/pages/Error";

const Router = () => {
    const browserRouter = createBrowserRouter([
        {
            path: "/",
            element: <Landing />,
            errorElement: <Error />,
        },
        {
            path: "/play",
            element: <Play />,
            errorElement: <Error />,
        },
    ]);

    return (
        <RouterProvider router={browserRouter} />
    )
}

export default Router;