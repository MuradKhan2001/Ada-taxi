import React, {useState, useEffect, createContext, useRef} from "react";
import {Routes, Route} from "react-router-dom";
import NotFound from "../notFound/NotFound";
import {MainRoutes} from "../../routes/Routes";
import Modal from "../modal/Modal";
import Alerts from "../alerts/Alerts";
import GetLocation from "../get-location/GetLocation";
import {w3cwebsocket as W3CWebSocket} from "websocket";
import {useDispatch, useSelector} from "react-redux";
import {addAlert, delAlert} from "../../redux/AlertsBox";
import {useTranslation} from "react-i18next";
import {changeLocation} from "../../redux/DriverLocation";
import {setPageNumber} from "../../redux/OrderPage";
import {AddClientInfo} from "../../redux/AddClient";
import {clearDropOffLocations} from "../../redux/DropOffLocations";
import {clearPickUpLocations} from "../../redux/PickUpLocations";
import {hideModal} from "../../redux/ModalContent";
import axios from "axios";
import {getOrder} from "../../redux/ActiveOrders";
import success from "./sound/success.wav";

export const webSockedContext = createContext();

const App = () => {
    const baseUrl = useSelector(store => store.baseUrl.data);
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const [sockedContext, setSockedContext] = useState(null);
    const audioRef = useRef(null);

    // const successAudio = () => new Audio(success).play();

    useEffect(() => {
        if (!localStorage.getItem("token")) return;

        const websocket = new W3CWebSocket(`wss://api.adataxi.uz/ws/client/?token=${localStorage.getItem("token")}`);
        setSockedContext(websocket);

        const idAlertError = Date.now();
        const netErrorAlert = {
            id: idAlertError,
            text: t("net"),
            img: "./images/red.svg",
            color: "#FFEDF1"
        };

        websocket.onclose = websocket.onerror = () => {
            dispatch(addAlert(netErrorAlert));
            setTimeout(() => window.location.reload(), 2000);
        };

        websocket.onopen = () => {
            dispatch(delAlert(idAlertError));
        };

        audioRef.current = new Audio(success);
    }, []);

    useEffect(() => {
        if (!sockedContext) return;

        const handleAlert = (textKey) => {
            const id = Date.now();
            dispatch(addAlert({id, text: t(textKey), img: "./images/green.svg", color: "#EDFFFA"}));
            setTimeout(() => dispatch(delAlert(id)), 5000);
            successAudio();
        };

        sockedContext.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.message?.code === -35) {
                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                window.location.pathname = "/";
                return;
            }

            switch (data.action) {
                case "order_accepted":
                    handleAlert("order_accepted");
                    getActiveOrders();
                    break;
                case "arrived":
                    handleAlert("arrived");
                    break;
                case "order_started":
                    handleAlert("order_started");
                    dispatch(setPageNumber(5));
                    break;
                case "trip_started":
                    handleAlert("trip_started");
                    break;
                case "order_finished":
                    dispatch(setPageNumber(0));
                    dispatch(changeLocation({}));
                    dispatch(AddClientInfo({name: "", phone: ""}));
                    dispatch(clearDropOffLocations());
                    dispatch(clearPickUpLocations());
                    handleAlert("order_finished");
                    break;
                default:
                    break;
            }

            if (data.action === "reject_order") {
                let idAlert = Date.now();
                let alert = {
                    id: idAlert, text: t("alert_cancel"), img: "./images/green.svg", color: "#EDFFFA"
                };
                dispatch(addAlert(alert));
                setTimeout(() => {
                    dispatch(delAlert(idAlert));
                }, 5000);
                dispatch(hideModal({show: false}))
                dispatch(setPageNumber(0))
                dispatch(changeLocation({}))
                dispatch(AddClientInfo({name: "", phone: "",}))
                dispatch(clearDropOffLocations())
                dispatch(clearPickUpLocations())
                successAudio()
            }

            if (data.action === "driver_location") {
                dispatch(changeLocation(data.message))
            }
        };
    }, [sockedContext]);

    const successAudio = () => {
        audioRef.current?.play().catch(() => {});
    };

    const getActiveOrders = () => {
        if (!localStorage.getItem("token")) return;

        axios.get(`${baseUrl}/api/v1/client-active-orders/`, {
            headers: {Authorization: `Token ${localStorage.getItem("token")}`}
        }).then((res) => {
            const order = res.data[0];
            if (!order) return;

            dispatch(getOrder(order));
            if (order.driver) {
                dispatch(setPageNumber(order.status === "started" ? 5 : 4));
            } else {
                dispatch(setPageNumber(3));
            }
        });
    };

    const cencelOrder = (id, reason) => {
        if (!sockedContext) {
            const id = Date.now();
            dispatch(addAlert({
                id,
                text: t("net"),
                img: "./images/red.svg",
                color: "#FFEDF1"
            }));
            return;
        }

        sockedContext.send(JSON.stringify({
            command: "reject_order",
            order_id: id,
            reason_id: reason
        }));
    };

    return (
        <webSockedContext.Provider value={cencelOrder}>
            <Modal/>
            <Alerts/>
            <GetLocation/>
            <Routes>
                {MainRoutes.map((route, i) => <Route key={i} {...route} />)}
                <Route path='*' element={<NotFound/>}/>
            </Routes>
        </webSockedContext.Provider>
    );
};

export default App;
