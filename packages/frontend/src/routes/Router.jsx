import { createBrowserRouter, RouterProvider } from "react-router-dom";

const Router = () => {
    const browserRouter = createBrowserRouter([
        {
            path: "/",
            element: <></>,
        },
    ]);

    return (
        <RouterProvider router={browserRouter} />
    )
}

export default Router;