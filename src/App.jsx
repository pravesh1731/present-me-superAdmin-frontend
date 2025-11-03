import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SignInPage from "./Pages/SignInPage/SignInPage";
import ErrorPage from "./Pages/error/ErrorPage";

function App() {
  

  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  )
}

const appRouter = createBrowserRouter([
  {
    path: "/signin",
    element: <SignInPage />,
    errorElement: <ErrorPage />,
  },
]);

export default App;
