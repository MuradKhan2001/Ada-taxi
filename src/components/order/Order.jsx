import React, {useEffect, useState, useContext} from 'react';
import "./style-order.scss";
import ReactStars from "react-stars";
import {hideModal, showModals} from "../../redux/ModalContent";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {addLocations, delLocations, clearPickUpLocations} from "../../redux/PickUpLocations";
import {addLocationsDrop, delLocationsDrop, clearDropOffLocations} from "../../redux/DropOffLocations";
import {AddClientInfo} from "../../redux/AddClient";
import {webSockedContext} from "../app/App";
import axios from "axios";
import i18next from "i18next";
import {ShowHideModal} from "../../redux/GetLocations";
import {addAlert, delAlert} from "../../redux/AlertsBox";

const Order = () => {
    let webSocked = useContext(webSockedContext);
    const baseUrl = useSelector((store) => store.baseUrl.data)
    const {t} = useTranslation();
    const [progress, setProgress] = useState(0);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const PickUpLocations = useSelector((store) => store.PickUpLocations.data)
    const DropOffLocations = useSelector((store) => store.DropOffLocations.data)
    const PaymentType = useSelector((store) => store.PaymentType.data)
    const OtherClients = useSelector((store) => store.AddClient.data)
    const [client_count, setClient_count] = useState(1);
    const [raidCount, setRaidCount] = useState();
    const [orderPage, setOrderPage] = useState(0);
    const [dots, setDots] = useState("");

    const direction = [
        {id: "regional", name: t("direction1")},
        {id: "postal", name: t("direction2")},
        {id: "minivan", name: t("direction3")},
        {id: "travel", name: t("direction4")},
    ];

    const [active_direction, setActive_direction] = useState("regional")

    const [price_list, setPrice_list] = useState([]);
    const [active_price, setActive_price] = useState("");

    const [comment_driver, setComment_driver] = useState("");

    const [services, setServices] = useState([]);
    const [active_service, setActive_service] = useState([]);
    const [all_seats, setAllSeats] = useState(false);

    const [pick_up_date, setPick_up_date] = useState("");
    const [pick_up_time, setPick_up_time] = useState("");

    const [sender_phone, setsender_phone] = useState("");
    const [receiver_phone, setReceiverPhone] = useState("");
    const [payer, setPayer] = useState("sender");

    const [active_order, setActive_Order] = useState([]);

    useEffect(() => {
        if (localStorage.getItem("token")) {
            axios.get(`${baseUrl}/api/v1/extra-services/`, {
                headers: {
                    "Authorization": `Token ${localStorage.getItem("token")}`
                }
            }).then((response) => {
                setServices(response.data);
            })
        }
        getPrice()
        getActiveOrders()
    }, []);

    useEffect(() => {
        getData()
    }, [PickUpLocations, DropOffLocations, active_service, all_seats, client_count, active_direction]);

    useEffect(() => {
        webSocked.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.action === "reject_order") {
                setOrderPage(0)
                let idAlert = Date.now();
                let alert = {
                    id: idAlert, text: t("alert_cancel"), img: "./images/green.svg", color: "#EDFFFA"
                };
                dispatch(addAlert(alert));
                setTimeout(() => {
                    dispatch(delAlert(idAlert));
                }, 5000);
                dispatch(hideModal({show: false}))
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
            }

            if (data.action === "order_finished") {
                let idAlert = Date.now();
                let alert = {
                    id: idAlert, text: t("order_finished"), img: "./images/green.svg", color: "#EDFFFA"
                };
                dispatch(addAlert(alert));
                setTimeout(() => {
                    dispatch(delAlert(idAlert));
                }, 5000);
            }

            if (data.action === "driver_location") {
                let idAlert = Date.now();
                let alert = {
                    id: idAlert, text: t("driver_location"), img: "./images/green.svg", color: "#EDFFFA"
                };
                dispatch(addAlert(alert));
                setTimeout(() => {
                    dispatch(delAlert(idAlert));
                }, 5000);
            }
        };
    }, [webSocked])

    useEffect(() => {
        const totalDuration = 3 * 60 * 1000;
        const interval = 1000;
        const step = (100 / (totalDuration / interval));
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev + step >= 100) return 0;
                return prev + step;
            });
        }, interval);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length < 3 ? prev + "." : ""));
        }, 500);

        return () => clearInterval(interval);
    }, []);

    const getActiveOrders = () => {
        axios.get(`${baseUrl}/api/v1/client-active-orders/`, {
            headers: {
                "Authorization": `Token ${localStorage.getItem("token")}`
            }
        }).then((response) => {
            setActive_Order(response.data[0]);
            if (response.data.length > 0) {
                if (response.data[0].driver) {
                    setOrderPage(4)
                } else setOrderPage(3)

            }
        })
    }

    const showModalContent = (status, id) => {
        dispatch(showModals({show: true, status: status, id}));
    };

    const addLocation = (location) => {
        if (location === "from" && PickUpLocations.length < 10) {
            let newLocation = {
                address: "",
                latitude: null,
                longitude: null,
                number: PickUpLocations.length + 1
            }
            dispatch(addLocations(newLocation));
        }

        if (location === "to" && DropOffLocations.length < 10) {
            let newLocation = {
                address: "",
                latitude: null,
                longitude: null,
                number: DropOffLocations.length + 1
            }
            dispatch(addLocationsDrop(newLocation));
        }
    }
    const delLocation = (location, indexToDelete) => {
        if (location === "from") {
            dispatch(delLocations(indexToDelete));
        }

        if (location === "to") {
            dispatch(delLocationsDrop(indexToDelete));
        }
    }

    const delClient = () => {
        let client = {
            name: "",
            phone: ""
        }
        dispatch(AddClientInfo(client))
    }

    const toggleService = (id) => {
        if (active_service.includes(id)) {
            setActive_service(active_service.filter((item) => item !== id));
        } else {
            setActive_service([...active_service, id]);
        }
    };

    const getPrice = () => {
        let price_info = {
            service: active_direction,
            from_region: {
                "latitude": 41.309484,
                "longitude": 69.251330
            },
            to_region: {
                "latitude": 40.764860,
                "longitude": 72.309999
            },
            passanger_count: client_count,
            book_all_seats: all_seats,
            extra_services: active_service
        }

        axios.get(`https://api.adataxi.uz/api/v1/get-prices/`, price_info).then((response) => {
            setPrice_list(response.data);
        })
    }

    const getLocations = (location_num = "", location_status = "") => {
        dispatch(ShowHideModal({show: true, location_num, location_status}));
    }

    const getData = () => {

        let data = {
            service: active_direction,
            from_region: PickUpLocations[0].latitude !== null ? PickUpLocations[0] : {},
            to_region: DropOffLocations[0].latitude !== null ? DropOffLocations[0] : {},
            passanger_count: client_count,
            book_all_seats: all_seats,
            extra_services: active_service
        }

        if ((PickUpLocations[0].latitude !== null) === (DropOffLocations[0].latitude !== null)) {
            axios.post(`https://api.adataxi.uz/api/v1/get-prices/`, data).then((response) => {
                setPrice_list(response.data)
            })
        }

    }

    const SendOrder = () => {
        let allInfo = {
            car_service: active_direction,
            car_category: active_price,
            passanger_count: client_count,
            payment_type: PaymentType.payment_type,
            pick_up_date: `${pick_up_date}T${pick_up_time}Z`,
            end_date: null,
            book_all_seats: all_seats,
            comment_to_driver: comment_driver,
            sender_phone,
            receiver_phone,
            payer,
            extra_services: active_service,
            pick_up_locations: PickUpLocations,
            drop_off_locations: DropOffLocations
        }

        if (pick_up_date && pick_up_time) {
            axios.post(`${baseUrl}/api/v1/order-create/`, allInfo, {
                headers: {
                    "Authorization": `Token ${localStorage.getItem("token")}`
                }
            }).then((response) => {
                setActive_Order([response.data])
                getActiveOrders()
                let idAlert = Date.now();
                let alert = {
                    id: idAlert, text: t("confirm"), img: "./images/green.svg", color: "#EDFFFA"
                };
                dispatch(addAlert(alert));
                setTimeout(() => {
                    dispatch(delAlert(idAlert));
                }, 5000);
                dispatch(clearPickUpLocations())
                dispatch(clearDropOffLocations())
            })
        } else {
            let idAlertError = Date.now();
            let alert = {
                id: idAlertError,
                text: t("confirm_form"),
                img: "./images/red.svg",
                color: "#FFEDF1",
            };
            dispatch(addAlert(alert));
            setTimeout(() => {
                dispatch(delAlert(idAlertError));
            }, 5000);
        }

    };

    return (
        <div className="order-wrapper">
            {orderPage === 0 && <div className="order-box">
                <div className="location-box">
                    <div className="bg-location">
                        {PickUpLocations.map((item, index) => {
                            return <div key={index} className="location-from">
                                <div className="circle-warpper">
                                    <div className="circle"></div>
                                </div>
                                <div className="location-text">
                                    <div className={`location-name`}>
                                        {item.address ? item.address : <div className="placeholder-address">
                                            {t("pick_up")}
                                        </div>}
                                    </div>

                                    <div onClick={() => getLocations(index, "pick_up")}
                                         className="loc-icon">
                                        <img src="./images/add-pin.png" alt="add" loading="lazy"/>
                                    </div>

                                    {PickUpLocations.length < 10 && index === 0 &&
                                        < div onClick={() => addLocation("from")} className="add-icon">
                                            <img src="./images/plus.webp" alt="add" loading="lazy"/>
                                        </div>}

                                    {index > 0 && <div className="del-icon">
                                        <img onClick={() => delLocation("from", item.number)} src="./images/trash.webp"
                                             alt="add" loading="lazy"/>
                                    </div>}
                                </div>
                            </div>
                        })}
                        {DropOffLocations.map((item, index) => {
                            return <div key={index} className="location-to">
                                <div className="circle-warpper">
                                    <div className="circle"></div>
                                </div>
                                <div className="location-text">
                                    <div className={`location-name`}>
                                        {item.address ? item.address : <div className="placeholder-address">
                                            {t("drop")}
                                        </div>}
                                    </div>

                                    <div onClick={() => getLocations(index, "drop_off")}
                                         className="loc-icon">
                                        <img src="./images/add-pin.png" alt="add" loading="lazy"/>
                                    </div>

                                    {DropOffLocations.length < 10 && index === 0 &&
                                        < div onClick={() => addLocation("to")} className="add-icon">
                                            <img src="./images/plus.webp" alt="add" loading="lazy"/>
                                        </div>}

                                    {index > 0 && <div className="del-icon">
                                        <img onClick={() => delLocation("to", item.number)} src="./images/trash.webp"
                                             alt="add" loading="lazy"/>
                                    </div>}
                                </div>
                            </div>
                        })}
                    </div>
                </div>
                <div className="tarif-box">
                    {direction.map((item, index) => {
                        return <div key={index} onClick={() => setActive_direction(item.id)}
                                    className={`tarif ${item.id === active_direction && "active"}`}>
                            {item.name}
                        </div>
                    })}
                </div>
                <div className="tarif-price">
                    {price_list.map((item, index) => {
                        return <div onClick={() => setActive_price(item.category && item.category.id)} key={index}>
                            <div
                                className={`tarif-card ${item.category && item.category.id === active_price && "active"}`}>
                                <img src={item.category && item.category.icon} alt="car" loading="lazy"/>
                                <div
                                    className="name">{item.category && item.category.translations[i18next.language].name}</div>
                                <div className="price">{item.cost} {t("sum")}</div>
                            </div>
                        </div>
                    })}
                </div>
                <div className="funtion">
                    <div className="left">
                        <img src="./images/sms2.webp" alt="sms" loading="lazy"/>
                        <input onChange={(e) => setComment_driver(e.target.value)}
                               value={comment_driver} placeholder={t("comment_driver")} type="text"/>
                    </div>
                </div>
                <div onClick={() => showModalContent("payment-type")} className="payment">
                    <div className="left">
                        <img src="./images/payment.webp" alt="sms" loading="lazy"/>
                        {t("payment_type")}
                    </div>
                    <div className="right">
                        {PaymentType.payment_type}
                        <img src="./images/more.webp" alt="more" loading="lazy"/>
                    </div>
                </div>

                {active_direction !== "postal" && OtherClients.name && OtherClients.phone ? <div className="other">
                    <div className="left">
                        <img src="./images/user-1.webp" alt="sms" loading="lazy"/>
                        <div className="info">
                            <div className="name">
                                {OtherClients.name}
                            </div>
                            <div className="phone">
                                {OtherClients.phone}
                            </div>
                        </div>
                    </div>
                    <div className="right">
                        <img onClick={delClient} src="./images/trash.webp" alt="more"
                             loading="lazy"/>
                    </div>
                </div> : active_direction !== "postal" &&
                    <div onClick={() => showModalContent("add-other")} className="funtion">
                        <div className="left">
                            <img src="./images/user-1.webp" alt="sms" loading="lazy"/>
                            {t("other_order")}
                        </div>
                        <img src="./images/more.webp" alt="more" loading="lazy"/>
                    </div>}
                <div className="services">
                    {active_direction !== "postal" && services.map((item, index) => {
                        const isActive = active_service.includes(item.id);
                        if (item.is_main) {
                            return <div key={index} className="service">
                                <div className="left">
                                    <div className="text">
                                        <div className="name">
                                            {item.translations[i18next.language].name}
                                        </div>
                                        <div className="price-service">
                                            To‘lov {item.price} {t("sum")}
                                        </div>
                                    </div>
                                </div>
                                <div className={`on-of ${isActive ? "active-icon" : ""}`}
                                     onClick={() => toggleService(item.id)}>
                                    <div className={`on-icon ${isActive ? "active" : ""}`}></div>
                                </div>
                            </div>
                        }
                    })}

                    {active_direction !== "postal" && <div onClick={() => setOrderPage(1)} className="service cursor">
                        <div className="left">
                            <img src="./images/filter.webp" alt="sms" loading="lazy"/>
                            {t("plus_service")}
                        </div>
                        <img src="./images/more.webp" alt="more" loading="lazy"/>
                    </div>}
                </div>
            </div>}
            {orderPage === 0 && <div onClick={() => {
                if (PickUpLocations[0].latitude !== null && DropOffLocations[0].latitude !== null && active_price) {
                    if (active_direction !== "postal") {
                        setOrderPage(6)
                    } else setOrderPage(7)
                } else {
                    let idAlertError = Date.now();
                    let alert = {
                        id: idAlertError,
                        text: "Tarif va manzillarni kiriting!",
                        img: "./images/red.svg",
                        color: "#FFEDF1",
                    };
                    dispatch(addAlert(alert));
                    setTimeout(() => {
                        dispatch(delAlert(idAlertError));
                    }, 5000);
                }
            }} className="button-box">
                <div className="button">
                    {t("next")}
                </div>
            </div>}

            {orderPage === 1 && <div className="services-box">
                <div className="header">
                    <img onClick={() => setOrderPage(0)} src="./images/prev.png" alt="prev" loading="lazy"/>
                    <div className="title">
                        {t("plus_service")}
                    </div>
                </div>
                {services.map((item, index) => {
                    const isActive = active_service.includes(item.id);
                    if (!item.is_main) {
                        return <div key={index} className="service">
                            <div className="left">
                                <div className="text">
                                    <div className="name">
                                        {item.translations[i18next.language].name}
                                    </div>
                                    <div className="price-service">
                                        {t("payment")} {item.price} {t("sum")}
                                    </div>
                                </div>
                            </div>
                            <div className={`on-of ${isActive ? "active-icon" : ""}`}
                                 onClick={() => toggleService(item.id)}>
                                <div className={`on-icon ${isActive ? "active" : ""}`}></div>
                            </div>
                        </div>
                    }
                })}
            </div>}

            {orderPage === 3 && <div className="search-driver">
                <div className="header">
                    <div className="title">
                        {t("search_driver")}
                    </div>
                    <span>{dots}</span>
                </div>
                <div className="loading">
                    <div className="loader" style={{width: `${progress}%`}}></div>
                </div>
                <div className="location-box">
                    <div className="location-from">
                        <div className="circle-warpper">
                            <div className="circle"></div>
                        </div>
                        <div className="location-text">
                            {active_order.pick_up_locations && active_order.pick_up_locations.map((item, index) => {
                                return <span key={index}>
                                    {item.address}
                                </span>
                            })}
                        </div>
                    </div>
                    <div className="line"></div>
                    <div className="location-to">
                        <div className="circle-warpper">
                            <div className="circle"></div>
                        </div>
                        <div className="location-text">
                            {active_order.drop_off_locations && active_order.drop_off_locations.map((item, index) => {
                                return <span key={index}>
                                    {item.address}
                                </span>
                            })}
                        </div>
                    </div>
                </div>
                <div className="info-box">
                    <div className="information">
                        <div className="label">
                            {t("direction")}
                        </div>
                        <div className="val">
                            {active_order.car_service && active_order.car_service.translations[i18next.language].name}
                        </div>
                    </div>
                    <div className="information">
                        <div className="label">
                            {t("tarif")}
                        </div>
                        <div className="val">
                            {active_order.car_category && active_order.car_category.translations[i18next.language].name}
                        </div>
                    </div>
                    <div className="information">
                        <div className="label">
                            {t("payment_type")}
                        </div>
                        <div className="val">
                            {active_order.payment_type}
                        </div>
                    </div>
                    <div className="information">
                        <div className="label">
                            {t("order_id")}
                        </div>
                        <div className="val">
                            {active_order.id}
                        </div>
                    </div>
                    <div className="information">
                        <div className="label">
                            {t("date_time")}
                        </div>
                        <div className="val">
                            {active_order.pick_up_date}
                        </div>
                    </div>
                </div>
                <div className="price-order">
                    <div className="information">
                        <div className="label">
                            {t("passangers_count")}
                        </div>
                        <div className="val">
                            {active_order.passanger_count}
                        </div>
                    </div>
                    <div className="information">
                        <div className="label">
                            {t("price")}
                        </div>
                        <div className="val-price">
                            {active_order.price} {t("sum")}
                        </div>
                    </div>
                </div>
                <div className="buttons">
                    <div onClick={() => showModalContent("cancel-order", active_order.id)} className="cancel-btn">
                        <img src="./images/x.webp" alt="cancel" loading="lazy"/>
                        {t("cancel_order")}
                    </div>
                    {/*<div className="line"></div>*/}
                    {/*<div className="share-btn">*/}
                    {/*    <img src="./images/share.webp" alt="cancel" loading="lazy"/>*/}
                    {/*    Ulashish*/}
                    {/*</div>*/}
                </div>
            </div>}

            {orderPage === 4 && <div className="get-driver">
                {/*<div className="header">*/}
                {/*    Haydovchi ~10 daqiqada keladi*/}
                {/*</div>*/}
                <div className="header-content">
                    <div className="car-info">
                        <div className="name-car">
                            {active_order.driver.car_color.translations[i18next.language].name}
                            &ensp;
                            {active_order.driver.car_make.translations[i18next.language].name}
                            &ensp;
                            {active_order.driver.car_model.translations[i18next.language].name}
                        </div>
                        <div className="car-number">
                            <div className="num">{active_order.driver.car_number.slice(0, 2)}</div>
                            <div className="line"></div>
                            <div className="num">{active_order.driver.car_number.slice(2)}</div>
                        </div>
                    </div>
                    <div className="car-img">
                        <img src={active_order.car_category.icon} alt="car" loading="lazy"/>
                    </div>
                </div>
                <div className="driver-info">
                    <div className="person-img">
                        <img src={active_order.driver.profile_image} alt=""/>
                    </div>
                    <div className="info">
                        <div className="name">
                            {active_order.driver.first_name}
                            &ensp;
                            {active_order.driver.last_name}
                        </div>
                        <div className="information">
                            <div className="rate">
                                <div className="label">{t("rate")}</div>
                                <div className="info">
                                    <img src="./images/star.webp" alt="star" loading="lazy"/>
                                    {active_order.driver.rate}
                                </div>
                            </div>
                            <div className="line"></div>
                            <div className="count">
                                <div className="label">{t("orders_finishet")}</div>
                                <div className="info">
                                    {active_order.driver.finished_orders_count}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="button-call">
                    <div className="call-driver">
                        <img src="./images/phone.png" alt="phone" loading="lazy"/>
                        <a href={`tel:${active_order.driver.phone}`}> {active_order.driver.phone}</a>
                    </div>
                </div>
                <div className="location-box">
                    <div className="location-from">
                        <div className="location-text">
                            {active_order.pick_up_locations.map((item_loc, index_loc) => {
                                return <div key={index_loc} className="location-from">
                                    <div className="circle-warpper">
                                        <div className="circle"></div>
                                    </div>
                                    <div className="location-text">
                                        {item_loc.address}
                                    </div>
                                </div>
                            })}
                        </div>
                    </div>
                    <div className="line"></div>
                    <div className="location-to">
                        <div className="location-text">
                            {active_order.drop_off_locations.map((item_loc, index_loc) => {
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
                    </div>
                </div>
                <div className="info-box">
                    <div className="information">
                        <div className="label">
                            {t("direction")}
                        </div>
                        <div className="val">
                            {active_order.car_service && active_order.car_service.translations[i18next.language].name}
                        </div>
                    </div>
                    <div className="information">
                        <div className="label">
                            {t("tarif")}
                        </div>
                        <div className="val">
                            {active_order.car_category && active_order.car_category.translations[i18next.language].name}
                        </div>
                    </div>
                    <div className="information">
                        <div className="label">
                            {t("payment_type")}
                        </div>
                        <div className="val">
                            {active_order.payment_type}
                        </div>
                    </div>
                    <div className="information">
                        <div className="label">
                            {t("order_id")}
                        </div>
                        <div className="val">
                            {active_order.id}
                        </div>
                    </div>
                    <div className="information">
                        <div className="label">
                            {t("date_time")}
                        </div>
                        <div className="val">
                            {active_order.pick_up_date}
                        </div>
                    </div>
                </div>
                <div className="price-order">
                    <div className="information">
                        <div className="label">
                            {t("passangers_count")}
                        </div>
                        <div className="val">
                            {active_order.passanger_count} kishi
                        </div>
                    </div>

                    <div className="information">
                        <div className="label">
                            {t("price")}
                        </div>
                        <div className="val-price">
                            {active_order.price} {t("sum")}
                        </div>
                    </div>
                </div>
                <div className="buttons">
                    <div onClick={() => showModalContent("cancel-order", active_order.id)} className="cancel-btn">
                        <img src="./images/x.webp" alt="cancel" loading="lazy"/>
                        {t("cancel_order")}
                    </div>
                </div>
            </div>}

            {orderPage === 5 && <div className="rate-driver">
                {/*<div className="header">*/}
                {/*    ~5 soatda yetib boramiz*/}
                {/*</div>*/}
                <div className="header-content">
                    <div className="car-info">
                        <div className="name-car">
                            {active_order.driver.car_color.translations[i18next.language].name}
                            &ensp;
                            {active_order.driver.car_make.translations[i18next.language].name}
                            &ensp;
                            {active_order.driver.car_model.translations[i18next.language].name}
                        </div>
                        <div className="car-number">
                            <div className="num">{active_order.driver.car_number.slice(0, 2)}</div>
                            <div className="line"></div>
                            <div className="num">{active_order.driver.car_number.slice(2)}</div>
                        </div>
                    </div>
                    <div className="car-img">
                        <img src={active_order.car_category.icon} alt="car" loading="lazy"/>
                    </div>
                </div>
                <div className="driver-info">
                    <div className="person-img">
                        <img src={active_order.driver.profile_image} alt=""/>
                    </div>
                    <div className="info">
                        <div className="name">
                            {active_order.driver.first_name}
                            &ensp;
                            {active_order.driver.last_name}
                        </div>
                        <div className="information">
                            <div className="rate">
                                <div className="label">{t("rate")}</div>
                                <div className="info">
                                    <img src="./images/star.webp" alt="star" loading="lazy"/>
                                    {active_order.driver.rate}
                                </div>
                            </div>
                            <div className="line"></div>
                            <div className="count">
                                <div className="label">{t("orders_finishet")}</div>
                                <div className="info">
                                    {active_order.driver.finished_orders_count}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="rate-stars">
                    <ReactStars
                        count={5}
                        onChange={(e) => {
                            setRaidCount(e);
                        }}
                        size={35}
                        color2={"rgba(250, 190, 25, 1)"}
                        half={false}
                    />
                </div>
                <div className="reason-box">
                    <div className="title">Qanday muammo yuz berdi ?</div>
                    <div className="reasons">
                        <div className="reason">
                            Haydovchi kech keldi
                        </div>
                        <div className="reason">Noto‘g‘ri manzilga bordi</div>
                        <div className="reason">Yo‘l davomida haydovchi muloqoti yoqimsiz bo‘ldi</div>
                        <div className="reason">Avtomobil toza emasdi</div>
                        <div className="reason">Xavfsiz harakat qilmadi</div>
                    </div>
                </div>
                <div className="location-box">
                    <div className="location-from">
                        <div className="location-text">
                            {active_order.pick_up_locations.map((item_loc, index_loc) => {
                                return <div key={index_loc} className="location-from">
                                    <div className="circle-warpper">
                                        <div className="circle"></div>
                                    </div>
                                    <div className="location-text">
                                        {item_loc.address}
                                    </div>
                                </div>
                            })}
                        </div>
                    </div>
                    <div className="line"></div>
                    <div className="location-to">
                        <div className="location-text">
                            {active_order.drop_off_locations.map((item_loc, index_loc) => {
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
                    </div>
                </div>
                <div className="info-box">
                    <div className="information">
                        <div className="label">
                            {t("direction")}
                        </div>
                        <div className="val">
                            {active_order.car_service && active_order.car_service.translations[i18next.language].name}
                        </div>
                    </div>
                    <div className="information">
                        <div className="label">
                            {t("tarif")}
                        </div>
                        <div className="val">
                            {active_order.car_category && active_order.car_category.translations[i18next.language].name}
                        </div>
                    </div>
                    <div className="information">
                        <div className="label">
                            {t("payment_type")}
                        </div>
                        <div className="val">
                            {active_order.payment_type}
                        </div>
                    </div>
                    <div className="information">
                        <div className="label">
                            {t("order_id")}
                        </div>
                        <div className="val">
                            {active_order.id}
                        </div>
                    </div>
                    <div className="information">
                        <div className="label">
                            {t("date_time")}
                        </div>
                        <div className="val">
                            {active_order.pick_up_date}
                        </div>
                    </div>
                </div>
                <div className="price-order">
                    <div className="information">
                        <div className="label">
                            {t("passangers_count")}
                        </div>
                        <div className="val">
                            {active_order.passanger_count} kishi
                        </div>
                    </div>

                    <div className="information">
                        <div className="label">
                            {t("price")}
                        </div>
                        <div className="val-price">
                            {active_order.price} {t("sum")}
                        </div>
                    </div>
                </div>
            </div>}

            {orderPage === 6 && <div className="info-box">
                <div className="header">
                    <img onClick={() => setOrderPage(0)} src="./images/prev.png" alt="prev" loading="lazy"/>
                    <div className="title">
                        {t("plus_info")}
                    </div>
                </div>
                <div className="form-date">
                    <div className="label">
                        {t("date")}
                    </div>
                    <div className="input-time">
                        <input value={pick_up_date} onChange={(e) => setPick_up_date(e.target.value)} type="date"/>
                    </div>
                </div>
                <div className="form-date">
                    <div className="label">
                        {t("time")}
                    </div>
                    <div className="input-time">
                        <input value={pick_up_time} onChange={(e) => setPick_up_time(e.target.value)} type="time"/>
                    </div>
                </div>
                <div className="client-count">
                    <div className="title">
                        {t("passangers_count")}
                    </div>
                    <div className="counter">
                        <div className="label">
                            {t("passangers_count")}
                        </div>
                        <div className="count">
                            <div onClick={() => {
                                if (client_count > 0) {
                                    setClient_count(prevState => prevState - 1)
                                }
                            }} className="button">
                                <img src="./images/minus-sm.png" alt="count"/>
                            </div>

                            <span>{client_count}</span>

                            <div onClick={() => {
                                if (client_count < 12) {
                                    setClient_count(prevState => prevState + 1)
                                }
                            }} className="button">
                                <img src="./images/plus-sm.png" alt="count"/>
                            </div>
                        </div>
                    </div>
                    <div className="line"></div>
                    <div className="service">
                        <div className="left">
                            <div className="text">
                                <div className="name">
                                    {t("all_seats")}
                                </div>
                            </div>
                        </div>
                        <div onClick={() => setAllSeats(prevState => !prevState)}
                             className={`on-of ${all_seats ? "active-icon" : ""}`}>
                            <div className={`on-icon ${all_seats ? "active" : ""}`}></div>
                        </div>
                    </div>
                </div>
                <div className="form-date">
                    <div className="label">
                        {t("price")}
                    </div>
                    <div className="input-time">
                        {price_list.map((item, index) => {
                            if (active_price === item.category.id) {
                                return <span key={index}>{item.cost} {t("sum")}</span>
                            }
                        })}
                    </div>
                </div>
            </div>}

            {orderPage === 7 && <div className="info-box-postal">
                <div className="header">
                    <img onClick={() => setOrderPage(0)} src="./images/prev.png" alt="prev" loading="lazy"/>
                    <div className="title">
                        {t("plus_info")}
                    </div>
                </div>
                <div className="info-postal">
                    <div className="title">{t("sender")}</div>
                    <div className="person-info">
                        <div className="left-icon-person">
                            <img src="./images/person.webp" alt="person"/>
                        </div>
                        <div className="right-info">
                            <div className="title">
                                {t("sender_location")}
                            </div>
                            <div className="bottom-info">
                                {PickUpLocations[0].address}
                            </div>
                        </div>
                    </div>
                    <div className="person-info">
                        <div className="left-icon-phone">
                            <img src="./images/phone-person.png" alt="person"/>
                        </div>
                        <div className="right-info">
                            <div className="title">
                                {t("phone")}
                            </div>
                            <div className="bottom-info">
                                <input value={sender_phone} onChange={(e) => setsender_phone(e.target.value)}
                                       placeholder={t("phone_form")} type="number"/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="info-postal">
                    <div className="title">{t("postal")}</div>
                    <div className="person-info">
                        <div className="left-icon-postal">
                            <img src="./images/package_2_fill.webp" alt="person"/>
                        </div>
                        <div className="right-info">
                            <div className="title">
                                {t("postal_location")}
                            </div>
                            <div className="bottom-info">
                                {DropOffLocations[0].address}
                            </div>
                        </div>
                    </div>
                    <div className="person-info">
                        <div className="left-icon-phone">
                            <img src="./images/phone-person.png" alt="person"/>
                        </div>
                        <div className="right-info">
                            <div className="title">
                                {t("phone")}
                            </div>
                            <div className="bottom-info">
                                <input value={receiver_phone} onChange={(e) => setReceiverPhone(e.target.value)}
                                       placeholder={t("phone_form")} type="number"/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="order-info">
                    <div className="title">
                        {t("about_order")}
                    </div>
                    <div className="payment-who">
                        <div className="title">{t("payment_who")}</div>

                        <div className="on-of">
                            <div onClick={() => setPayer("sender")} className={`of ${payer === "sender" ? "on" : ""}`}>
                                {t("person1")}
                            </div>
                            <div onClick={() => setPayer("receiver")}
                                 className={`of ${payer === "receiver" ? "on" : ""}`}>
                                {t("person2")}
                            </div>
                        </div>
                    </div>

                    <div className="form-date">
                        <div className="label">
                            {t("date")}
                        </div>
                        <div className="input-time">
                            <input value={pick_up_date} onChange={(e) => setPick_up_date(e.target.value)} type="date"/>
                        </div>
                    </div>

                    <div className="form-date">
                        <div className="label">
                            {t("time")}
                        </div>
                        <div className="input-time">
                            <input value={pick_up_time} onChange={(e) => setPick_up_time(e.target.value)} type="time"/>
                        </div>
                    </div>
                </div>
            </div>}

            {(orderPage === 6 || orderPage === 7) && <div onClick={SendOrder} className="button-box">
                <div className="button">
                    {t("order")}
                </div>
            </div>}
        </div>
    );
};

export default Order;