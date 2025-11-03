import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SignInPage from "./Pages/SignInPage/SignInPage";
import ErrorPage from "./Pages/error/ErrorPage";
import Header from "./Components/Header/Header";
import Dashboard from "./Pages/Home/Dashboard";
import Teacher from "./Pages/Home/Teacher";
import Student from "./Pages/Home/Student";
import PendingInstitute from "./Pages/Home/PendingInstitute/PendingInstitute";
import PendingInstituteDetailsPage from "./Pages/Home/PendingInstitute/PendingInstituteDetailsPage";
import VerifiedInstitute from "./Pages/Home/VerifiedInstitute/VerifiedInstitute";
import VerifiedInstituteDetailsPage from "./Pages/Home/VerifiedInstitute/VerifiedInstituteDetailsPage";
import Chat from "./Pages/Home/Chat";

function App() {
  

  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  )
}

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Header />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "/teachers", element: <Teacher /> },
      { path: "/students", element: <Student /> },
      { path: "/pending-institutes", element: <PendingInstitute /> },
      { path: "/pending-institutes/:id", element: <PendingInstituteDetailsPage /> },
      { path: "/verified-institutes", element: <VerifiedInstitute /> },
  { path: "/verified-institutes/:id", element: <VerifiedInstituteDetailsPage /> },
      { path: "/chat", element: <Chat /> },
      
    ],
    errorElement: <ErrorPage />,
  },
  {
    path: "/signin",
    element: <SignInPage />,
    errorElement: <ErrorPage />,
  },
]);

export default App;
