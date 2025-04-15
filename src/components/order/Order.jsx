import React, {useEffect, useState} from 'react';
import "./style-order.scss";
import ReactStars from "react-stars";
import {showModals} from "../../redux/ModalContent";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {addLocations, delLocations} from "../../redux/PickUpLocations";
import {addLocationsDrop, delLocationsDrop} from "../../redux/DropOffLocations";
import {AddClientInfo} from "../../redux/AddClient";
import axios from "axios";
import i18next from "i18next";

const Order = () => {
    const baseUrl = useSelector((store) => store.baseUrl.data)
    const {t} = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const PickUpLocations = useSelector((store) => store.PickUpLocations.data)
    const DropOffLocations = useSelector((store) => store.DropOffLocations.data)
    const PaymentType = useSelector((store) => store.PaymentType.data)
    const OtherClients = useSelector((store) => store.AddClient.data)
    const [client_count, setClient_count] = useState(0);
    const [raidCount, setRaidCount] = useState();
    const [orderPage, setOrderPage] = useState(0);

    const [direction, setDirection] = useState([
        {id: "regional", name: "Taksi"},
        {id: "postal", name: "Po'chta"},
        {id: "minivan", name: "Miniven"},
        {id: "travel", name: "Sayohat"},
    ]);
    const [active_direction, setActive_direction] = useState("regional")

    const [price_list, setPrice_list] = useState([
        {
            id: 1,
            img: "./images/car-tarif.webp",
            name: "Ekonom",
            price: "1 000"
        },
        {
            id: 2,
            img: "./images/car-tarif.webp",
            name: "Komford",
            price: "1 000 000"
        },
        {
            id: 3,
            img: "./images/car-tarif.webp",
            name: "Komford pro",
            price: "1 500 000"
        }
    ]);
    const [active_price, setActive_price] = useState(1);

    const [comment_driver, setComment_driver] = useState("");

    const [services, setServices] = useState([]);
    const [active_service, setActive_service] = useState([]);
    const [all_seats, setAllSeats] = useState(false);

    const [pick_up_date, setPick_up_date] = useState("");
    const [pick_up_time, setPick_up_time] = useState("");

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
    }, []);

    const showModalContent = (status, location_num = "", location_status = "") => {
        dispatch(showModals({show: true, status: status, location_num, location_status}));
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
                                            Olib ketish manzilini tanlang
                                        </div>}
                                    </div>

                                    <div onClick={() => showModalContent("add-location", index, "pick_up")}
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
                                            Yetkazish manzilini tanlang
                                        </div>}
                                    </div>

                                    <div onClick={() => showModalContent("add-location", index, "drop_off")}
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
                        return <div onClick={() => setActive_price(item.id)} key={index}>
                            <div className={`tarif-card ${item.id === active_price && "active"}`}>
                                <img src={item.category && item.category.icon} alt="car" loading="lazy"/>
                                <div
                                    className="name">{item.category && item.category.translations[i18next.language].name}</div>
                                <div className="price">{item.cost} so'm</div>
                            </div>
                        </div>
                    })}
                </div>
                <div className="funtion">
                    <div className="left">
                        <img src="./images/sms2.webp" alt="sms" loading="lazy"/>
                        <input onChange={(e) => setComment_driver(e.target.value)}
                               value={comment_driver} placeholder="Haydovchi uchun izoh qoldiring..." type="text"/>
                    </div>
                </div>
                <div onClick={() => showModalContent("payment-type")} className="payment">
                    <div className="left">
                        <img src="./images/payment.webp" alt="sms" loading="lazy"/>
                        Tolov turi
                    </div>
                    <div className="right">
                        {PaymentType.payment_type}
                        <img src="./images/more.webp" alt="more" loading="lazy"/>
                    </div>
                </div>

                {OtherClients.name && OtherClients.phone ? <div className="other">
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


                </div> : <div onClick={() => showModalContent("add-other")} className="funtion">
                    <div className="left">
                        <img src="./images/user-1.webp" alt="sms" loading="lazy"/>
                        Boshqa uchun buyurtma qilish
                    </div>
                    <img src="./images/more.webp" alt="more" loading="lazy"/>
                </div>}

                <div className="services">
                    {services.map((item, index) => {
                        const isActive = active_service.includes(item.id);
                        if (item.is_main) {
                            return <div key={index} className="service">
                                <div className="left">
                                    <div className="text">
                                        <div className="name">
                                            {item.translations[i18next.language].name}
                                        </div>
                                        <div className="price-service">
                                            To‘lov {item.price} so‘m
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

                    <div onClick={() => setOrderPage(1)} className="service cursor">
                        <div className="left">
                            <img src="./images/filter.webp" alt="sms" loading="lazy"/>
                            Qo‘shimcha xizmatlar
                        </div>
                        <img src="./images/more.webp" alt="more" loading="lazy"/>
                    </div>
                </div>
            </div>}
            {orderPage === 0 && <div onClick={() => setOrderPage(6)} className="button-box">
                <div className="button">
                    Keyingi
                </div>
            </div>}

            {orderPage === 1 && <div className="services-box">
                <div className="header">
                    <img onClick={() => setOrderPage(0)} src="./images/prev.png" alt="prev" loading="lazy"/>

                    <div className="title">
                        Qo'shimcha xizmatlar
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
                                        To‘lov {item.price} so‘m
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
            {orderPage === 1 && <div className="button-box">
                <div className="button">
                    Saqlash
                </div>
            </div>}

            {orderPage === 3 && <div className="search-driver">
                <div className="header">
                    Haydovchi qidirilmoqda...
                </div>
                <div className="loading">
                    <div className="loader"></div>
                </div>
                <div className="location-box">
                    <div className="location-from">
                        <div className="circle-warpper">
                            <div className="circle"></div>
                        </div>
                        <div className="location-text">
                            Chilonzor tumani, Chilonzor M-mavze, 11, Toshkent
                        </div>
                    </div>

                    <div className="line"></div>

                    <div className="location-to">
                        <div className="circle-warpper">
                            <div className="circle"></div>
                        </div>
                        <div className="location-text">
                            Andijon viloyati, Baliqchi tumani, Baliqchi hokimyati
                        </div>
                    </div>
                </div>
                <div className="info-box">
                    <div className="information">
                        <div className="label">
                            Tarif
                        </div>
                        <div className="val">
                            Ekonom
                        </div>
                    </div>

                    <div className="information">
                        <div className="label">
                            To‘lov turi
                        </div>
                        <div className="val">
                            Naqt
                        </div>
                    </div>

                    <div className="information">
                        <div className="label">
                            Buyurtma raqami
                        </div>
                        <div className="val">
                            4922184921
                        </div>
                    </div>

                    <div className="information">
                        <div className="label">
                            Safar kuni va vaqti
                        </div>
                        <div className="val">
                            13-oktyabr, 12:00
                        </div>
                    </div>
                </div>
                <div className="price-order">
                    <div className="information">
                        <div className="label">
                            Yo‘lovchilar soni
                        </div>
                        <div className="val">
                            4 kishi
                        </div>
                    </div>

                    <div className="information">
                        <div className="label">
                            Yo‘l haqi summasi
                        </div>
                        <div className="val-price">
                            400 000 so'm
                        </div>
                    </div>
                </div>
                <div className="buttons">
                    <div onClick={() => showModalContent("cancel-order")} className="cancel-btn">
                        <img src="./images/x.webp" alt="cancel" loading="lazy"/>
                        Bekor qilish
                    </div>
                    <div className="line"></div>
                    <div className="share-btn">
                        <img src="./images/share.webp" alt="cancel" loading="lazy"/>
                        Ulashish
                    </div>
                </div>
            </div>}

            {orderPage === 4 && <div className="get-driver">
                <div className="header">
                    Haydovchi ~10 daqiqada keladi
                </div>
                <div className="header-content">
                    <div className="car-info">
                        <div className="name-car">Oq Toyota Camry</div>
                        <div className="car-number">
                            <div className="num">01</div>
                            <div className="line"></div>
                            <div className="num">A 707 DA</div>
                        </div>
                    </div>
                    <div className="car-img">
                        <img src="./images/car-taxi.webp" alt="car" loading="lazy"/>
                    </div>
                </div>
                <div className="driver-info">
                    <div className="person-img">
                        <img src="./images/driver.png" alt=""/>
                    </div>
                    <div className="info">
                        <div className="name">Alisher Akbarov</div>
                        <div className="information">
                            <div className="rate">
                                <div className="label">Reyting:</div>
                                <div className="info">
                                    <img src="./images/star.webp" alt="star" loading="lazy"/>
                                    5.5
                                </div>
                            </div>
                            <div className="line"></div>
                            <div className="count">
                                <div className="label">Safarlar:</div>
                                <div className="info">1,230</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="button-call">
                    <div className="call-driver">
                        <img src="./images/phone.png" alt="phone" loading="lazy"/>
                        Qo'ng'iroq qilish
                    </div>
                </div>
                <div className="location-box">
                    <div className="location-from">
                        <div className="circle-warpper">
                            <div className="circle"></div>
                        </div>
                        <div className="location-text">
                            Chilonzor tumani, Chilonzor M-mavze, 11, Toshkent
                        </div>
                    </div>

                    <div className="line"></div>

                    <div className="location-to">
                        <div className="circle-warpper">
                            <div className="circle"></div>
                        </div>
                        <div className="location-text">
                            Andijon viloyati, Baliqchi tumani, Baliqchi hokimyati
                        </div>
                    </div>
                </div>
                <div className="info-box">
                    <div className="information">
                        <div className="label">
                            Tarif
                        </div>
                        <div className="val">
                            Ekonom
                        </div>
                    </div>

                    <div className="information">
                        <div className="label">
                            To‘lov turi
                        </div>
                        <div className="val">
                            <img src="./images/money.webp" alt="money" loading="lazy"/>Naqt
                        </div>
                    </div>

                    <div className="information">
                        <div className="label">
                            Buyurtma raqami
                        </div>
                        <div className="val">
                            4922184921
                        </div>
                    </div>

                    <div className="information">
                        <div className="label">
                            Safar kuni va vaqti
                        </div>
                        <div className="val">
                            13-oktyabr, 12:00
                        </div>
                    </div>
                </div>
                <div className="price-order">
                    <div className="information">
                        <div className="label">
                            Yo‘lovchilar soni
                        </div>
                        <div className="val">
                            <img src="./images/users.webp" alt="users" loading="lazy"/>
                            4 kishi
                        </div>
                    </div>

                    <div className="information">
                        <div className="label">
                            Yo‘l haqi summasi
                        </div>
                        <div className="val-price">
                            400 000 so'm
                        </div>
                    </div>
                </div>
                <div className="buttons">
                    <div onClick={() => showModalContent("cancel-order")} className="cancel-btn">
                        <img src="./images/x.webp" alt="cancel" loading="lazy"/>
                        Bekor qilish
                    </div>
                    <div className="line"></div>
                    <div className="share-btn">
                        <img src="./images/share.webp" alt="cancel" loading="lazy"/>
                        Ulashish
                    </div>
                </div>
            </div>}

            {orderPage === 5 && <div className="rate-driver">
                <div className="header">
                    ~5 soatda yetib boramiz
                </div>
                <div className="header-content">
                    <div className="car-info">
                        <div className="name-car">Oq Toyota Camry</div>
                        <div className="car-number">
                            <div className="num">01</div>
                            <div className="line"></div>
                            <div className="num">A 707 DA</div>
                        </div>
                    </div>
                    <div className="car-img">
                        <img src="./images/car-taxi.webp" alt="car" loading="lazy"/>
                    </div>
                </div>
                <div className="driver-info">
                    <div className="person-img">
                        <img src="./images/driver.png" alt=""/>
                    </div>
                    <div className="info">
                        <div className="name">Alisher Akbarov</div>
                        <div className="information">
                            <div className="rate">
                                <div className="label">Reyting:</div>
                                <div className="info">
                                    <img src="./images/star.webp" alt="star" loading="lazy"/>
                                    5.5
                                </div>
                            </div>
                            <div className="line"></div>
                            <div className="count">
                                <div className="label">Safarlar:</div>
                                <div className="info">1,230</div>
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
                        <div className="circle-warpper">
                            <div className="circle"></div>
                        </div>
                        <div className="location-text">
                            Chilonzor tumani, Chilonzor M-mavze, 11, Toshkent
                        </div>
                    </div>

                    <div className="line"></div>

                    <div className="location-to">
                        <div className="circle-warpper">
                            <div className="circle"></div>
                        </div>
                        <div className="location-text">
                            Andijon viloyati, Baliqchi tumani, Baliqchi hokimyati
                        </div>
                    </div>
                </div>
                <div className="info-box">
                    <div className="information">
                        <div className="label">
                            Tarif
                        </div>
                        <div className="val">
                            Ekonom
                        </div>
                    </div>

                    <div className="information">
                        <div className="label">
                            To‘lov turi
                        </div>
                        <div className="val">
                            <img src="./images/money.webp" alt="money" loading="lazy"/>Naqt
                        </div>
                    </div>

                    <div className="information">
                        <div className="label">
                            Buyurtma raqami
                        </div>
                        <div className="val">
                            4922184921
                        </div>
                    </div>

                    <div className="information">
                        <div className="label">
                            Safar kuni va vaqti
                        </div>
                        <div className="val">
                            13-oktyabr, 12:00
                        </div>
                    </div>
                </div>
                <div className="price-order">
                    <div className="information">
                        <div className="label">
                            Yo‘lovchilar soni
                        </div>
                        <div className="val">
                            <img src="./images/users.webp" alt="users" loading="lazy"/>
                            4 kishi
                        </div>
                    </div>

                    <div className="information">
                        <div className="label">
                            Yo‘l haqi summasi
                        </div>
                        <div className="val-price">
                            400 000 so'm
                        </div>
                    </div>
                </div>
            </div>}


            {orderPage === 6 && <div className="info-box">
                <div className="header">
                    <img onClick={() => setOrderPage(0)} src="./images/prev.png" alt="prev" loading="lazy"/>

                    <div className="title">
                        Qo'shimcha malumotlar
                    </div>
                </div>

                <div className="form-date">
                    <div className="label">
                        Safar sanasi
                    </div>
                    <div className="input-time">
                        <input value={pick_up_date} onChange={(e) => setPick_up_date(e.target.value)} type="date"/>
                    </div>
                </div>

                <div className="form-date">
                    <div className="label">
                        Olib ketish vaqti
                    </div>
                    <div className="input-time">
                        <input value={pick_up_time} onChange={(e) => setPick_up_time(e.target.value)} type="time"/>
                    </div>
                </div>

                <div className="client-count">
                    <div className="title">
                        Yo'lovchialr soni
                    </div>
                    <div className="counter">
                        <div className="label">
                            Yo'lovchilar soni
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
                                    Barcha orindiqlarni band qilish
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
                        Yo'l haqqi narxi
                    </div>
                    <div className="input-time">
                        120 000 so'm
                    </div>
                </div>
            </div>}
            {orderPage === 6 && <div className="button-box">
                <div className="button">
                    Buyurtma berish
                </div>
            </div>}

        </div>
    );
};

export default Order;