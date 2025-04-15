import React, {useMemo, useState, useEffect, createContext} from "react";
import {Routes, Route} from "react-router-dom";
import NotFound from "../notFound/NotFound";
import {MainRoutes} from "../../routes/Routes";
import Modal from "../modal/Modal";
import Alerts from "../alerts/Alerts";

export const webSockedContext = createContext();

const App = () => {
    const user = useMemo(() => localStorage.getItem('token'), []);
    const [sockedContext, setSockedContext] = useState(null);

    return <webSockedContext.Provider value={sockedContext}>
        <Modal/>
        <Alerts/>

        <Routes>
            {MainRoutes.map((route, index) => (<Route key={index} {...route} />))}
            <Route path={'*'} element={<NotFound/>}/>
        </Routes>
    </webSockedContext.Provider>
};

export default App;