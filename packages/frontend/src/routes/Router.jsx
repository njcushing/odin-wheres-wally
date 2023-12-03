import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Landing from "@/pages/Landing";

const Router = () => {
    const browserRouter = createBrowserRouter([
        {
            path: "/",
            element: <Landing />,
        },
    ]);

    return (
        <RouterProvider router={browserRouter} />
    )
}

export default Router;