import React, {useState, useMemo, useEffect, useRef} from "react";
import "./style-dashboard.scss";
import Header from "../header/Header";
import {
    GoogleMap,
    MarkerF,
    useLoadScript
} from "@react-google-maps/api";
import {GOOGLE_MAPS_API_KEY} from "./googleMapsApi";
import i18next from "i18next";
import Loader from "../loader/Loader";
import Order from "../order/Order";
import {CSSTransition} from "react-transition-group";
import {hideModal, showModals} from "../../redux/ModalContent";
import {useDispatch, useSelector} from "react-redux";
import axios from "axios";
import {useMediaQuery} from "@mui/material";
import {useTranslation} from "react-i18next";
import {Helmet} from "react-helmet"

const libraries = ["places"];

const Dashboard = () => {
    const isMobile = useMediaQuery("(max-width: 1024px)");
    const {t} = useTranslation();
    const baseUrl = useSelector((store) => store.baseUrl.data)
    const DriverLocation = useSelector((store) => store.DriverLocation.data)
    // const [invalidService, setInvalidService] = useState("finished");
    const [showModal, setShowModal] = useState(false);
    const [center, setCenter] = useState();
    const dispatch = useDispatch();
    const modalContent = useSelector((store) => store.ModalContent.data);
    const nodeRef = useRef(null);
    const [history, setHistory] = useState([]);
    const [order_info, setOrder_info] = useState({});

    const selectAddressIcon = {
        url: "./images/address.png",
        scaledSize: {width: 40, height: 50},
    };

    const driverIcon = {
        url: "./images/driver-icon.png",
        scaledSize: {width: 60, height: 60},
    };

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            const {latitude, longitude} = position.coords;
            let locMy = {lat: latitude, lng: longitude};
            setCenter(locMy);
        });

        axios.get(`${baseUrl}/api/v1/client-history/`, {
                headers: {
                    "Authorization": `Token ${localStorage.getItem("token")}`
                }
            }
        ).then((response) => {
            setHistory(response.data);
        }).catch((error) => {
            if (error.response.status == 401 && !isMobile) {
                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                showModalContent("log-in")
            }
        });

    }, []);

    const {isLoaded} = useLoadScript({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: libraries,
        language: i18next.language,
    });

    const options = useMemo(
        () => ({
            disableDefaultUI: true,
            clickableIcons: false,
        }),
        []
    );

    const showModalContent = (status) => {
        dispatch(showModals({show: true, status: status}));
    };

    if (!isLoaded) return <Loader/>;
    return (
        <>
            <Helmet>
                <title>{t("home-title")}</title>
                <meta name="description"
                      content={t("home-des")}/>
            </Helmet>
            <div className="dashboard-wrapper">
                <CSSTransition
                    in={modalContent.show && modalContent.status === "orders"}
                    nodeRef={nodeRef}
                    timeout={300}
                    classNames="alert"
                    unmountOnExit>
                    <div
                        className={`modal-sloy-orders ${showModal ? "disabled" : ""}`}>
                        <div ref={nodeRef} className="modal-card">
                            <div className="header-buttons">
                                <div className="header">
                                    <h1 className="title">
                                        {t("my_orders")}
                                    </h1>
                                    <div className="cancel-btn">
                                        <img
                                            onClick={() => {
                                                dispatch(hideModal({show: false}))
                                            }}
                                            src="./images/cancel.webp"
                                            alt="cancel"
                                        />
                                    </div>
                                </div>
                                {/*<div className="on-of">*/}
                                {/*    <div onClick={() => setInvalidService("finished")}*/}
                                {/*         className={`of ${invalidService === "finished" ? "on" : ""}`}>*/}
                                {/*        {t("finished_order")}*/}
                                {/*    </div>*/}
                                {/*    <div onClick={() => setInvalidService("rejected")}*/}
                                {/*         className={`of ${invalidService === "rejected" ? "on" : ""}`}>*/}
                                {/*        {t("concelled_order")}*/}
                                {/*    </div>*/}
                                {/*</div>*/}
                            </div>
                            <div className="orders-list">
                                {history.map((item, index) => {
                                    return <div key={index} className="order">
                                        <div className="date-order">{item.created_at.split(" ")[0]}</div>
                                        <div onClick={() => {
                                            setShowModal(true)
                                            setOrder_info(item);
                                        }} className="order-info">
                                            {item.pick_up_locations.map((item_loc, index_loc) => {
                                                return <div key={index_loc} className="location-from">
                                                    <div className="circle-warpper">
                                                        <div className="circle"></div>
                                                    </div>
                                                    <div className="location-text">
                                                        {item_loc.address}
                                                    </div>
                                                </div>
                                            })}
                                            <div className="line"></div>
                                            {item.drop_off_locations.map((item_loc, index_loc) => {
                                                return <div key={index_loc} className="location-to">
                                                    <div className="circle-warpper">
                                                        <div className="circle"></div>
                                                    </div>
                                                    <div className="location-text">
                                                        {item_loc.address}
                                                    </div>
                                                </div>
                                            })}
                                            <div className="bottom-info">
                                                <div className="left-info">
                                                    <div className="text">
                                                        {item.created_at.split(" ")[1].slice(0, 5)}
                                                    </div>
                                                    <div className="dot"></div>
                                                    <div className="text">
                                                        {item.car_category.translations[i18next.language].name}
                                                    </div>
                                                </div>
                                                <div className="price">

                                                    {item.price} {t("sum")}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                })}
                            </div>
                        </div>
                    </div>
                </CSSTransition>

                <CSSTransition
                    in={showModal}
                    nodeRef={nodeRef}
                    timeout={300}
                    classNames="alert"
                    unmountOnExit
                >
                    <div className="modal-sloy-orders">
                        <div ref={nodeRef} className="modal-card-about-order">
                            <div className="header">
                                <div onClick={() => setShowModal(false)} className="cancel-btn">
                                    <img src="./images/cancel.webp"
                                         alt="cancel"
                                    />
                                </div>
                            </div>
                            {order_info.driver && order_info.client && order_info && <div className="content">
                                <div className="header-content">
                                    <div className="car-info">
                                        <div className="name-car">
                                            {order_info.driver.car_color.translations[i18next.language].name}
                                            &ensp;
                                            {order_info.driver.car_make.translations[i18next.language].name}
                                            &ensp;
                                            {order_info.driver.car_model.translations[i18next.language].name}
                                        </div>
                                        <div className="car-number">
                                            <div className="num">{order_info.driver.car_number.slice(0, 2)}</div>
                                            <div className="line"></div>
                                            <div className="num">{order_info.driver.car_number.slice(2)}</div>
                                        </div>
                                    </div>
                                    <div className="car-img">
                                        <img src={baseUrl + "/" + order_info.car_category.icon} alt="car"
                                             loading="lazy"/>
                                    </div>
                                </div>
                                <div className="driver-info">
                                    <div className="person-img">
                                        <img src={baseUrl + "/" + order_info.driver.profile_image} alt=""/>
                                    </div>
                                    <div className="info">
                                        <div className="name">
                                            {order_info.driver.first_name}
                                            &ensp;
                                            {order_info.driver.last_name}
                                        </div>
                                        <div className="information">
                                            <div className="rate">
                                                <div className="label">{t("rate")}</div>
                                                <div className="info">
                                                    <img src="./images/star.webp" alt="star" loading="lazy"/>
                                                    {order_info.driver.rate}
                                                </div>
                                            </div>
                                            <div className="line"></div>
                                            <div className="count">
                                                <div className="label">{t("orders_finishet")}</div>
                                                <div className="info">{order_info.driver.finished_orders_count}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="location-box">
                                    {order_info.pick_up_locations.map((item_loc, index_loc) => {
                                        return <div key={index_loc} className="location-from">
                                            <div className="circle-warpper">
                                                <div className="circle"></div>
                                            </div>
                                            <div className="location-text">
                                                {item_loc.address}
                                            </div>
                                        </div>
                                    })}
                                    <div className="line"></div>
                                    {order_info.drop_off_locations.map((item_loc, index_loc) => {
                                        return <div key={index_loc} className="location-to">
                                            <div className="circle-warpper">
                                                <div className="circle"></div>
                                            </div>
                                            <div className="location-text">
                                                {item_loc.address}
                                            </div>
                                        </div>
                                    })}
                                </div>
                                <div className="information-box-order">
                                    <div className="list">
                                        <div className="title">{t("direction")}</div>
                                        <div className="value">
                                            {order_info.car_service.translations[i18next.language].name}
                                        </div>
                                    </div>
                                    <div className="list">
                                        <div className="title">{t("tarif")}</div>
                                        <div className="value">
                                            {order_info.car_category.translations[i18next.language].name}
                                        </div>
                                    </div>
                                    <div className="list">
                                        <div className="title">{t("payment_type")}</div>
                                        <div className="value">
                                            <img src="./images/money.webp" alt="money" loading="lazy"/>
                                            {order_info.payment_type === "cash" && t("cash")}
                                            {order_info.payment_type === "card" && t("card")}
                                        </div>
                                    </div>
                                    {order_info.car_service && order_info.car_service.translations["en"].name === "Postal" && <>
                                        <div className="list">
                                            <div className="title">
                                                {t("sender")}
                                            </div>
                                            <div className="value">
                                                {order_info.sender_phone}
                                            </div>
                                        </div>
                                        <div className="list">
                                            <div className="title">
                                                {t("person2")}
                                            </div>
                                            <div className="value">
                                                {order_info.receiver_phone}
                                            </div>
                                        </div>
                                        <div className="list">
                                            <div className="title">
                                                {t("pay_who")}
                                            </div>
                                            <div className="value">
                                                {order_info.payer === "sender" ? t("sender") : t("person2")}
                                            </div>
                                        </div>
                                    </>}
                                    <div className="list">
                                        <div className="title">{t("order_id")}</div>
                                        <div className="value">{order_info.id}</div>
                                    </div>
                                    <div className="list">
                                        <div className="title">{t("date_time")}</div>
                                        <div className="value">
                                            {order_info.end_date ? order_info.end_date : order_info.pick_up_date}
                                        </div>
                                    </div>
                                    {order_info.car_service && order_info.car_service.translations["en"].name !== "Postal" &&
                                        <div className="information-plus">
                                            <div className="label">
                                                {t("plus_service")}
                                            </div>
                                            <div className="val">
                                                {order_info.extra_services.map((item, index) => {
                                                    return <span key={index}>
                                        {item.translations[i18next.language].name}
                                    </span>
                                                })}
                                            </div>
                                        </div>}
                                </div>

                                <div className="bottom-info">
                                    {order_info.car_service && order_info.car_service.translations["en"].name !== "Postal" &&
                                        <div className="list">
                                            <div className="title">
                                                {t("passangers_count")}
                                            </div>
                                            <div className="value">
                                                {order_info.passanger_count}
                                            </div>
                                        </div>}

                                    <div className="list">
                                        <div className="title">
                                            {t("price")}
                                        </div>
                                        <div className="value price">
                                            {order_info.discount_price > 0 && order_info.discount_price}
                                            {order_info.price > 0 && order_info.price} {t("sum")}
                                        </div>
                                    </div>
                                </div>
                                {/*<div className="del-btn">*/}
                                {/*    <img src="./images/trash.webp" alt="del" loading="lazy"/>*/}
                                {/*    {t("del_info")}*/}
                                {/*</div>*/}
                            </div>}
                        </div>
                    </div>
                </CSSTransition>

                <div className="top-side">
                    <Header/>
                </div>

                <div className="bottom-side">
                    <GoogleMap
                        zoom={11}
                        center={center}
                        options={options}
                        mapContainerClassName="map"
                    >
                        {center && (
                            <MarkerF
                                position={center}
                                icon={selectAddressIcon}
                            />)}


                        {DriverLocation.latitude && DriverLocation.longitude && (
                            <MarkerF
                                position={{lat: DriverLocation.latitude, lng: DriverLocation.longitude}}
                                icon={driverIcon}
                            />)}

                    </GoogleMap>
                    <Order/>
                    <div className="app-box">
                        <div className="top-side-app">
                            <a target="_blank" href="https://apps.apple.com/us/app/adataxi/id6744370881"
                               className="button">
                                <div className="left">
                                    <img src="./images/apple.webp" alt="apple" loading="lazy"/>
                                </div>
                                <div className="right">
                                    <div className="top-text">Download on the</div>
                                    <b>App store</b>
                                </div>
                            </a>
                            <a target="_blank" href="https://play.google.com/store/apps/details?id=uz.adataxi.client"
                               className="button">
                                <div className="left">
                                    <img src="./images/google.webp" alt="google" loading="lazy"/>
                                </div>
                                <div className="right">
                                    <div className="top-text">GET IT ON</div>
                                    <b>Google Play</b>
                                </div>
                            </a>
                        </div>
                        <div className="bottom-side-app">
                            <a target="_blank" href="https://adataxi.uz/offer-app">
                                © 2025 ООО «ADA TAXI»
                                {t("offer")}
                            </a>
                        </div>
                    </div>
                    <div className="text-warning">
                        {t("map_warning")}
                    </div>
                </div>
            </div>
            <div className="mobil-device">
                <div className="logo">
                    <img src="./images/logo3.webp" alt="logo"/>
                </div>
                <div className="des">
                    "Mijoz Ada Taxi" platformasini
                    <span> PLANSHET </span>
                    va
                    <span> MOBIL TELEFON </span>
                    qurilmalari orqali foydalanish uchun App store yoki Play marketdan "Ada taxi" ilovasini yuklab
                    olishingiz mumkin!
                </div>
                <div className="app-box">
                    <div className="top-side-app">
                        <a target="_blank" href="https://apps.apple.com/us/app/adataxi/id6744370881"
                           className="button">
                            <div className="left">
                                <img src="./images/apple.webp" alt="apple" loading="lazy"/>
                            </div>
                            <div className="right">
                                <div className="top-text">Download on the</div>
                                <b>App store</b>
                            </div>
                        </a>
                        <a target="_blank" href="https://play.google.com/store/apps/details?id=uz.adataxi.client"
                           className="button">
                            <div className="left">
                                <img src="./images/google.webp" alt="google" loading="lazy"/>
                            </div>
                            <div className="right">
                                <div className="top-text">GET IT ON</div>
                                <b>Google Play</b>
                            </div>
                        </a>
                    </div>
                    <div className="bottom-side-app">
                        <a target="_blank" href="https://adataxi.uz/offer-app">
                            © 2025 ООО «ADA TAXI»
                            {t("offer")}
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;