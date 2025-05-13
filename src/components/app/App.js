import React, {useState, useEffect, createContext} from "react";
import {Routes, Route} from "react-router-dom";
import NotFound from "../notFound/NotFound";
import {MainRoutes} from "../../routes/Routes";
import Modal from "../modal/Modal";
import Alerts from "../alerts/Alerts";
import GetLocation from "../get-location/GetLocation";
import {w3cwebsocket as W3CWebSocket} from "websocket"
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
import success2 from "./sound/success2.wav";

export const webSockedContext = createContext();

const App = () => {
    const baseUrl = useSelector((store) => store.baseUrl.data)
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const [sockedContext, setSockedContext] = useState(null);

    function successAudio() {
        new Audio(success).play()
    }

    function successOrder() {
        new Audio(success2).play()
    }

    useEffect(() => {
        if (!localStorage.getItem("token")) return () => {
        }

        const websocket = new W3CWebSocket(`wss://api.adataxi.uz/ws/client/?token=${localStorage.getItem("token")}`);

        setSockedContext(websocket);

        let idAlertError = Date.now();

        // websocket.onclose = () => {
        //     let alert = {
        //         id: idAlertError, text: t("net"), img: "./images/red.svg", color: "#FFEDF1"
        //     };
        //     dispatch(addAlert(alert));
        //     setTimeout(() => {
        //         // window.location.reload()
        //     }, 2000)
        // }
        //
        // websocket.onerror = (event) => {
        //     let alert = {
        //         id: idAlertError, text: t("net"), img: "./images/red.svg", color: "#FFEDF1"
        //     };
        //     dispatch(addAlert(alert));
        //     setTimeout(() => {
        //         window.location.reload()
        //     }, 2000)
        // };
        //
        // websocket.onopen = () => {
        //     dispatch(delAlert(idAlertError));
        // }
    }, []);

    useEffect(() => {
        setSockedContext(websocket => {
            if (!websocket) return null
            websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.action) {
                    if (data.action === "order_accepted") {
                        let idAlert = Date.now();
                        let alert = {
                            id: idAlert, text: t("order_accepted"), img: "./images/green.svg", color: "#EDFFFA"
                        };
                        dispatch(addAlert(alert));
                        setTimeout(() => {
                            dispatch(delAlert(idAlert));
                        }, 5000);
                        getActiveOrders()
                        successAudio()
                    }

                    if (data.action === "arrived") {
                        let idAlert = Date.now();
                        let alert = {
                            id: idAlert, text: t("arrived"), img: "./images/green.svg", color: "#EDFFFA"
                        };
                        dispatch(addAlert(alert));
                        setTimeout(() => {
                            dispatch(delAlert(idAlert));
                        }, 5000);
                        successAudio()
                    }

                    if (data.action === "order_started") {
                        let idAlert = Date.now();
                        let alert = {
                            id: idAlert, text: t("order_started"), img: "./images/green.svg", color: "#EDFFFA"
                        };
                        dispatch(addAlert(alert));
                        setTimeout(() => {
                            dispatch(delAlert(idAlert));
                        }, 5000);
                        successAudio()
                        dispatch(setPageNumber(5))
                    }

                    if (data.action === "trip_started") {
                        let idAlert = Date.now();
                        let alert = {
                            id: idAlert, text: t("trip_started"), img: "./images/green.svg", color: "#EDFFFA"
                        };
                        dispatch(addAlert(alert));
                        setTimeout(() => {
                            dispatch(delAlert(idAlert));
                        }, 5000);
                        successAudio()
                    }

                    if (data.action === "order_finished") {

                        dispatch(setPageNumber(0))
                        dispatch(changeLocation({}))
                        dispatch(AddClientInfo({name: "", phone: "",}))
                        dispatch(clearDropOffLocations())
                        dispatch(clearPickUpLocations())

                        dispatch(changeLocation({}))
                        let idAlert = Date.now();
                        let alert = {
                            id: idAlert, text: t("order_finished"), img: "./images/green.svg", color: "#EDFFFA"
                        };
                        dispatch(addAlert(alert));
                        setTimeout(() => {
                            dispatch(delAlert(idAlert));
                        }, 5000);
                        successAudio()
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
                }
                if (data.message.code == -35) {
                    window.location.pathname = "/";
                    localStorage.removeItem("token");
                    localStorage.removeItem("userId");
                }
            };
            return websocket
        })
    }, [sockedContext])

    const getActiveOrders = () => {
        if (localStorage.getItem("token")) {
            axios.get(`${baseUrl}/api/v1/client-active-orders/`, {
                headers: {
                    "Authorization": `Token ${localStorage.getItem("token")}`
                }
            }).then((response) => {
                dispatch(getOrder(response.data[0]));
                if (response.data.length > 0) {
                    if (response.data[0].driver) {
                        if (response.data[0].status === "started") {
                            dispatch(setPageNumber(5))
                        } else dispatch(setPageNumber(4))
                    } else {
                        dispatch(setPageNumber(3))
                    }

                }
            })
        }
    }

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