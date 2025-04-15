import React, {useState, useMemo, useEffect, useRef} from "react";
import "./style-dashboard.scss";
import Header from "../header/Header";
import {
    GoogleMap,
    Marker,
    useLoadScript,
    MarkerClusterer,
} from "@react-google-maps/api";
import {GOOGLE_MAPS_API_KEY} from "./googleMapsApi";
import i18next from "i18next";
import Loader from "../loader/Loader";
import Order from "../order/Order";
import {CSSTransition} from "react-transition-group";
import {hideModal, showModals} from "../../redux/ModalContent";
import {useDispatch, useSelector} from "react-redux";
import axios from "axios";

const libraries = ["places"];

const Dashboard = () => {
    const baseUrl = useSelector((store) => store.baseUrl.data)
    const [invalidService, setInvalidService] = useState("finished");
    const [showModal, setShowModal] = useState(false);
    const [center, setCenter] = useState();
    const dispatch = useDispatch();
    const modalContent = useSelector((store) => store.ModalContent.data);
    const nodeRef = useRef(null);
    const [history, setHistory] = useState([]);
    const [order_info, setOrder_info] = useState({});

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
            if (error.response.status == 401) {
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
            <div className="dashboard-wrapper">
                <CSSTransition
                    in={modalContent.show && modalContent.status === "orders"}
                    nodeRef={nodeRef}
                    timeout={300}
                    classNames="alert"
                    unmountOnExit
                >
                    <div
                        className={`modal-sloy-orders ${showModal ? "disabled" : ""}`}>
                        <div ref={nodeRef} className="modal-card">
                            <div className="header-buttons">
                                <div className="header">
                                    <h1 className="title">
                                        Buyurtmalarim
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
                                <div className="on-of">
                                    <div onClick={() => setInvalidService("finished")}
                                         className={`of ${invalidService === "finished" ? "on" : ""}`}>
                                        Yakunlangan
                                    </div>
                                    <div onClick={() => setInvalidService("rejected")}
                                         className={`of ${invalidService === "rejected" ? "on" : ""}`}>
                                        Bekor qilingan
                                    </div>
                                </div>
                            </div>
                            <div className="orders-list">
                                {history.map((item, index) => {
                                    if (item.status === invalidService) {
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
                                                        {item.price} so'm
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    }
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
                                            {order_info.driver.car_model.translations[i18next.language].name}
                                        </div>
                                        <div className="car-number">
                                            <div className="num">{order_info.driver.car_number.slice(0, 2)}</div>
                                            <div className="line"></div>
                                            <div className="num">{order_info.driver.car_number.slice(2)}</div>
                                        </div>
                                    </div>
                                    <div className="car-img">
                                        <img src={baseUrl + order_info.car_category.icon} alt="car" loading="lazy"/>
                                    </div>
                                </div>

                                <div className="driver-info">
                                    <div className="person-img">
                                        <img src={baseUrl + order_info.driver.profile_image} alt=""/>
                                    </div>
                                    <div className="info">
                                        <div className="name">
                                            {order_info.driver.first_name}
                                            &ensp;
                                            {order_info.driver.last_name}
                                        </div>
                                        <div className="information">
                                            <div className="rate">
                                                <div className="label">Reyting:</div>
                                                <div className="info">
                                                    <img src="./images/star.webp" alt="star" loading="lazy"/>
                                                    {order_info.driver.rate}
                                                </div>
                                            </div>
                                            <div className="line"></div>
                                            <div className="count">
                                                <div className="label">Safarlar:</div>
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
                                        <div className="title">Tarif</div>
                                        <div className="value">
                                            {order_info.car_category.translations[i18next.language].name}
                                        </div>
                                    </div>
                                    <div className="list">
                                        <div className="title">To'lov turi</div>
                                        <div className="value">
                                            <img src="./images/money.webp" alt="money" loading="lazy"/>
                                            {order_info.payment_type === "cash" && "Naqt"}
                                            {order_info.payment_type === "card" && "Karta orqali"}
                                        </div>
                                    </div>
                                    <div className="list">
                                        <div className="title">Buyurtma raqami</div>
                                        <div className="value">{order_info.id}</div>
                                    </div>
                                    <div className="list">
                                        <div className="title">Safar kuni va vaqti</div>
                                        <div className="value">
                                            {order_info.end_date ? order_info.end_date : order_info.pick_up_date}
                                        </div>
                                    </div>
                                </div>

                                <div className="bottom-info">
                                    <div className="list">
                                        <div className="title">Yo'lovchilar soni</div>
                                        <div className="value">
                                            <img src="./images/users.webp" alt="users" loading="lazy"/>
                                            {order_info.passanger_count} kishi
                                        </div>
                                    </div>
                                    <div className="list">
                                        <div className="title">Narx</div>
                                        <div className="value price">
                                            {order_info.price} so'm</div>
                                    </div>
                                </div>

                                <div className="del-btn">
                                    <img src="./images/trash.webp" alt="del" loading="lazy"/>
                                    Ma'lumotni o'chirish
                                </div>
                            </div>}

                        </div>
                    </div>
                </CSSTransition>

                <div className="top-side">
                    <Header/>
                </div>

                <div className="bottom-side">
                    <GoogleMap
                        zoom={10}
                        center={center}
                        options={options}
                        mapContainerClassName="map"
                    >
                    </GoogleMap>

                    <Order/>

                    <div className="app-box">
                        <div className="top-side-app">
                            <a href="#" className="button">
                                <div className="left">
                                    <img src="./images/apple.webp" alt="apple" loading="lazy"/>
                                </div>
                                <div className="right">
                                    <div className="top-text">Download on the</div>
                                    <b>App store</b>
                                </div>
                            </a>
                            <a href="#" className="button">
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
                            <a href="#">
                                © 2025 ООО «ADA TAXI»
                                Foydalanish shartlari
                            </a>
                        </div>
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
                    qurilmalari orqali foydalasnish uchun App store, Play marketdan yuklab olishingiz mumkin!
                </div>


                <div className="app-box">
                    <div className="top-side-app">
                        <a href="#" className="button">
                            <div className="left">
                                <img src="./images/apple.webp" alt="apple" loading="lazy"/>
                            </div>
                            <div className="right">
                                <div className="top-text">Download on the</div>
                                <b>App store</b>
                            </div>
                        </a>
                        <a href="#" className="button">
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
                        <a href="#">
                            © 2025 ООО «ADA TAXI»
                            Foydalanish shartlari
                        </a>
                    </div>
                </div>

            </div>
        </>
    );
};

export default Dashboard;