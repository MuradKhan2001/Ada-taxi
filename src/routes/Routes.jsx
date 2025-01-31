import Dashboard from "../components/dashboard/Dashboard";
import Login from "../components/login/Login";
import Register from "../components/register/Register";
import MapBox from "../components/map/MapBox";
import PostOrder from "../components/post-order/PostOrder";
import Profile from "../components/profile/Profile";
import Notification from "../components/notification/Notification";
import History from "../components/history/History";
import SettingsMobile from "../components/settings-mobile/SettingsMobile";

export const loginRoutes = [
    {
        path: "/",
        element: <Login/>
    },
    {
        path: "/register",
        element: <Register/>
    }
];

export const userRoutes = [
    {
        path: "/*",
        element: <Dashboard/>
    },
];

export const userPageRoutes = [
    {
        path: "/",
        element: <MapBox/>
    },
    {
        path: "/post-order",
        element: <PostOrder/>
    },
    {
        path: "/profile",
        element: <Profile/>
    },
    {
        path: "/news",
        element: <Notification/>
    },
    {
        path: "/history",
        element: <History/>
    },
    {
        path: "/settings",
        element: <SettingsMobile/>
    },
];


