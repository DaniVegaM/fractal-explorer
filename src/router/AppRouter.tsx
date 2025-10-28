import { createBrowserRouter, RouterProvider } from "react-router";
import HomePage from "../pages/HomePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};