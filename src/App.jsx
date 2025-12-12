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
import { Provider } from "react-redux";
import appStore from "./Components/utils/appstore";

function App() {
  return (
    <Provider store={appStore}>
      <div>
        <RouterProvider router={appRouter} />
      </div>
    </Provider>
  );
}

const appRouter = createBrowserRouter([
  {
    path: "/superadmin",
    element: <Header />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "/superadmin/teachers", element: <Teacher /> },
      { path: "/superadmin/students", element: <Student /> },
      { path: "/superadmin/pending-institutes", element: <PendingInstitute /> },
      {
        path: "/superadmin/pending-institutes/:id",
        element: <PendingInstituteDetailsPage />,
      },
      {
        path: "/superadmin/verified-institutes",
        element: <VerifiedInstitute />,
      },
      {
        path: "/superadmin/verified-institutes/:id",
        element: <VerifiedInstituteDetailsPage />,
      },
      { path: "/superadmin/chat", element: <Chat /> },
    ],
    errorElement: <ErrorPage />,
  },
  {
    path: "/superadmin/signin",
    element: <SignInPage />,
    errorElement: <ErrorPage />,
  },
]);

export default App;
