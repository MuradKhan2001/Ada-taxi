import React, {useState, useEffect, createContext} from "react";
import {Routes, Route} from "react-router-dom";
import NotFound from "../notFound/NotFound";
import {MainRoutes} from "../../routes/Routes";
import Modal from "../modal/Modal";
import Alerts from "../alerts/Alerts";
import GetLocation from "../get-location/GetLocation";
import {w3cwebsocket as W3CWebSocket} from "websocket"
import {useDispatch} from "react-redux";
import {addAlert, delAlert} from "../../redux/AlertsBox";
import {useTranslation} from "react-i18next";


export const webSockedContext = createContext();

const App = () => {
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const [sockedContext, setSockedContext] = useState(null);

    useEffect(() => {
        if (!localStorage.getItem("token")) return () => {
        }

        const websocket = new W3CWebSocket(`wss://api.adataxi.uz/ws/client/?token=${localStorage.getItem("token")}`);

        setSockedContext(websocket);

        let idAlertError = Date.now();

        websocket.onclose = () => {
            let alert = {
                id: idAlertError, text: t("net"), img: "./images/red.svg", color: "#FFEDF1"
            };
            dispatch(addAlert(alert));
            setTimeout(() => {
                window.location.reload()
            }, 2000)
        }

        websocket.onerror = (event) => {
            let alert = {
                id: idAlertError, text: t("net"), img: "./images/red.svg", color: "#FFEDF1"
            };
            dispatch(addAlert(alert));
            setTimeout(() => {
                window.location.reload()
            }, 2000)
        };

        websocket.onopen = () => {
            dispatch(delAlert(idAlertError));
        }
    }, []);

    useEffect(() => {
        setSockedContext(websocket => {
            if (!websocket) return null
            websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.message.code == -35) {
                    window.location.pathname = "/";
                    localStorage.removeItem("token");
                    localStorage.removeItem("userId");
                }
            };
            return websocket
        })

    }, [sockedContext])

    return <webSockedContext.Provider value={sockedContext}>
        <Modal/>
        <Alerts/>
        <GetLocation/>
        <Routes>
            {MainRoutes.map((route, index) => (<Route key={index} {...route} />))}
            <Route path={'*'} element={<NotFound/>}/>
        </Routes>
    </webSockedContext.Provider>
};

export default App;