import Dashboard from "../components/dashboard/Dashboard";
import Profile from "../components/profile/Profile";
import EditProfile from "../components/edit-profile/EditProfile";

export const MainRoutes = [
    {
        path: "/",
        element: <Dashboard/>
    },
    {
        path: "/profile",
        element: <Profile/>
    },
    {
        path: "/edit-profile",
        element: <EditProfile/>
    },
];


