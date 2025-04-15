import {useRef, useState, useMemo, useEffect} from "react";
import {CSSTransition} from "react-transition-group";
import {useSelector, useDispatch} from "react-redux";
import {hideModal, showModals} from "../../redux/ModalContent";
import PhoneInput from "react-phone-number-input";
import AuthCode from "react-auth-code-input";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {GoogleMap, Marker, useLoadScript} from "@react-google-maps/api";
import {Combobox, ComboboxInput, ComboboxOption} from "@reach/combobox";
import i18next from "i18next";
import {GOOGLE_MAPS_API_KEY} from "./googleMapsApi";
import {useOnKeyPress} from "./useOnKeyPress";
import "./style.scss";
import {addAlert, delAlert} from "../../redux/AlertsBox";
import {updateDropLocationPickUp} from "../../redux/PickUpLocations";
import {updateDropLocationDrop} from "../../redux/DropOffLocations";
import {AddClientInfo} from "../../redux/AddClient";
import {changePayment} from "../../redux/PaymentType";
import {useTranslation} from "react-i18next";
import usePlacesAutocomplete, {getGeocode, getLatLng} from "use-places-autocomplete";
import "@reach/combobox/styles.css";
import Loader from "../loader/Loader";

const libraries = ["places"];

const Modal = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const nodeRef = useRef(null);
    const baseUrl = useSelector((store) => store.baseUrl.data);
    const dispatch = useDispatch();
    const modalContent = useSelector((store) => store.ModalContent.data);
    const PickUpLocations = useSelector((store) => store.PickUpLocations.data)
    const DropOffLocations = useSelector((store) => store.DropOffLocations.data)
    const PaymentType = useSelector((store) => store.PaymentType.data)

    const [phone, setPhone] = useState("");
    const [code, setCode] = useState("");
    const [checkCode, setCheckCode] = useState(false);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(60);
    const [reason, setReason] = useState(0);
    const [center, setCenter] = useState(null);
    const [searchLocationAddress, setSearchLocationAddress] = useState("");
    const [selected, setSelected] = useState(null);
    const [other_clinet_phone, setOtherClinetPhone] = useState("");
    const [other_clinet_name, setOtherClinetName] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            if (seconds > 0) {
                setSeconds(seconds - 1);
            }
            if (seconds === 0) {
                if (minutes === 0) {
                    clearInterval(interval);
                } else {
                    setSeconds(60);
                    setMinutes(minutes - 1);
                }
            }
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [checkCode ? seconds : null]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            const {latitude, longitude} = position.coords;
            let locMy = {lat: latitude, lng: longitude};
            setCenter(locMy);
        });
    }, []);

    useEffect(() => {
        if (modalContent.location_status === "pick_up") {
            if (PickUpLocations[modalContent.location_num].address) {
                let locMy = {
                    lat: PickUpLocations[modalContent.location_num].latitude,
                    lng: PickUpLocations[modalContent.location_num].longitude
                };
                setCenter(locMy);
                setSelected(locMy)
                setSearchLocationAddress(PickUpLocations[modalContent.location_num].address)
            } else {
                navigator.geolocation.getCurrentPosition((position) => {
                    const {latitude, longitude} = position.coords;
                    let locMy = {lat: latitude, lng: longitude};
                    setCenter(locMy);
                });
            }
        }

        if (modalContent.location_status === "drop_off") {
            if (DropOffLocations[modalContent.location_num].address) {
                let locMy = {
                    lat: DropOffLocations[modalContent.location_num].latitude,
                    lng: DropOffLocations[modalContent.location_num].longitude
                };
                setCenter(locMy);
                setSelected(locMy)
                setSearchLocationAddress(DropOffLocations[modalContent.location_num].address)
            } else {
                navigator.geolocation.getCurrentPosition((position) => {
                    const {latitude, longitude} = position.coords;
                    let locMy = {lat: latitude, lng: longitude};
                    setCenter(locMy);
                });
            }
        }

    }, [modalContent.status === "add-location"]);

    const logOut = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        window.location.reload();
        window.location.pathname = "/";
    };

    const resetTimer = () => {
        setMinutes(0);
        setSeconds(59);
    };

    const getCodeValue = (e) => {
        setCode(e);
    };

    const HandleLogin = () => {
        let user = {
            phone: phone,
            role: "client",
        };
        axios
            .post(`${baseUrl}/api/v1/auth/verify_number/`, user)
            .then((response) => {
                localStorage.setItem("userId", response.data.user_id);
                setCheckCode((prevState) => true);
                dispatch(showModals({show: true, status: "log-in-code"}));
                if (checkCode) {
                    resetTimer();
                }
            })
            .catch((error) => {
                if (error.response.status === 400) {
                    if (error.response.data.code === -10) {
                        let idAlert = Date.now();
                        let alert = {
                            id: idAlert,
                            text: "Telefon raqam noto'g'ri",
                            img: "./images/yellow.svg",
                            color: "#FFFAEA",
                        };
                        dispatch(addAlert(alert));
                        setTimeout(() => {
                            dispatch(delAlert(idAlert));
                        }, 5000);
                    }
                }
            });
    };

    const CheckCode = () => {
        axios
            .post(`${baseUrl}/api/v1/auth/test_verify_code/`, {
                user: localStorage.getItem("userId"),
                code: code,
                role: "client"
            })
            .then((response) => {

                localStorage.setItem("token", response.data.token);
                dispatch(hideModal({show: false}))
                window.location.pathname = "/edit-profile";
                let idAlert = Date.now();
                let alert = {
                    id: idAlert,
                    text: "Siz ro'yxatdan o'tdingiz!",
                    img: "./images/green.svg",
                    color: "#FFFAEA",
                };
                dispatch(addAlert(alert));
                setTimeout(() => {
                    dispatch(delAlert(idAlert));
                }, 5000);

            })
            .catch((error) => {
                if (error.response.status === 400) {
                    if (error.response.data.code === -12) {
                        let idAlert = Date.now();
                        let alert = {
                            id: idAlert,
                            text: "Kiritilgan kod notog'ri!",
                            img: "./images/red.svg",
                            color: "#FFFAEA",
                        };
                        dispatch(addAlert(alert));
                        setTimeout(() => {
                            dispatch(delAlert(idAlert));
                        }, 5000);
                    }
                }
            });
    };

    const selectAddressIcon = {
        url: "./images/address.png",
        scaledSize: {width: 40, height: 50},
    };

    const PlacesAutocomplete = ({setSelected}) => {
        const {
            ready,
            value,
            setValue,
            suggestions: {status, data},
            clearSuggestions,
        } = usePlacesAutocomplete({
            requestOptions: {
                language: i18next.language,
            },
        });

        const handleSelect = async (address) => {
            const results = await getGeocode({address});
            const {lat, lng} = await getLatLng(results[0]);
            let locMy = {lat, lng};
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&lan=en`;

            axios
                .get(`${url}`, {
                    headers: {
                        "Accept-Language": i18next.language,
                    },
                })
                .then((res) => {
                    let city = res.data.address.city;
                    let suburb = res.data.address.suburb;
                    let neighbourhood = res.data.address.neighbourhood;
                    let county = res.data.address.county;
                    let road = res.data.address.road;
                    let fullAddress = `${
                        city ? city + "," : ""
                    } ${suburb ? suburb + "," : ""} 
            ${neighbourhood ? neighbourhood + "," : ""} ${
                        county ? county + "," : ""
                    } ${road ? road : ""}`;

                    if (res.data.address.country_code === "uz") {
                        if (modalContent.location_status === "pick_up") {
                            setSearchLocationAddress(fullAddress);
                            setSelected(locMy);
                            setCenter({lat, lng});
                            setValue(address, false);
                            clearSuggestions();
                        } else if (modalContent.location_status === "drop_off") {
                            setSearchLocationAddress(fullAddress);
                            setSelected(locMy);
                            setCenter({lat, lng});
                            setValue(address, false);
                            clearSuggestions();
                        }

                    } else {
                        let idAlert = Date.now();
                        let alert = {
                            id: idAlert,
                            text: t("errorLocations"),
                            img: "./images/red.svg",
                            color: "#FFEDF1",
                        };
                        dispatch(addAlert(alert));
                        setTimeout(() => {
                            dispatch(delAlert(idAlert));
                        }, 5000);
                    }


                });
        };

        return (
            <Combobox onSelect={handleSelect}>
                <ComboboxInput
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={!ready}
                    className="combobox-input"
                    placeholder={t("input1")}
                />

                <div className="address-wrapper">
                    <div className="list-address">
                        {status === "OK" &&
                            data.map(({place_id, description}) => (
                                <ComboboxOption key={place_id} value={description}/>
                            ))}
                    </div>
                </div>
            </Combobox>
        );
    };
    const ClicklLocation = (e) => {
        let latitude = e.latLng.lat();
        let longitude = e.latLng.lng();

        let locMy = {lat: latitude, lng: longitude};

        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&lan=en`;

        axios
            .get(`${url}`, {
                headers: {
                    "Accept-Language": i18next.language,
                },
            })
            .then((res) => {
                let city = res.data.address.city;
                let suburb = res.data.address.suburb;
                let neighbourhood = res.data.address.neighbourhood;
                let county = res.data.address.county;
                let road = res.data.address.road;
                let fullAddress = `${
                    city ? city + "," : ""
                } ${suburb ? suburb + "," : ""} 
            ${neighbourhood ? neighbourhood + "," : ""} ${
                    county ? county + "," : ""
                } ${road ? road : ""}`;

                if (res.data.address.country_code === "uz") {
                    if (modalContent.location_status === "pick_up") {
                        setSearchLocationAddress(fullAddress);
                        setSelected(locMy);
                    } else if (modalContent.location_status === "drop_off") {
                        setSearchLocationAddress(fullAddress);
                        setSelected(locMy);
                    }
                } else {
                    let idAlert = Date.now();
                    let alert = {
                        id: idAlert,
                        text: t("errorLocations"),
                        img: "./images/red.svg",
                        color: "#FFEDF1",
                    };
                    dispatch(addAlert(alert));
                    setTimeout(() => {
                        dispatch(delAlert(idAlert));
                    }, 5000);
                }


            });
    };
    const getAddressLocation = () => {
        if (modalContent.location_status === "pick_up") {
            if (searchLocationAddress && selected) {
                dispatch(updateDropLocationPickUp({
                    index: Number(modalContent.location_num),
                    newData: {
                        address: searchLocationAddress,
                        latitude: Number(selected.lat.toString().slice(0, 9)),
                        longitude: Number(selected.lng.toString().slice(0, 9))
                    }
                }));
                dispatch(hideModal({show: false}))
                setSelected(null);
                setSearchLocationAddress("")
            } else {
                let idAlert = Date.now();
                let alert = {
                    id: idAlert,
                    text: t("alert7"),
                    img: "./images/yellow.svg",
                    color: "#FFFAEA",
                };
                dispatch(addAlert(alert));
                setTimeout(() => {
                    dispatch(delAlert(idAlert));
                }, 5000);
            }
        }
        if (modalContent.location_status === "drop_off") {
            if (searchLocationAddress && selected) {
                dispatch(updateDropLocationDrop({
                    index: Number(modalContent.location_num),
                    newData: {
                        address: searchLocationAddress,
                        latitude: Number(selected.lat.toString().slice(0, 9)),
                        longitude: Number(selected.lng.toString().slice(0, 9))
                    }
                }));
                dispatch(hideModal({show: false}))
                setSelected(null);
                setSearchLocationAddress("")
            } else {
                let idAlert = Date.now();
                let alert = {
                    id: idAlert,
                    text: t("alert7"),
                    img: "./images/yellow.svg",
                    color: "#FFFAEA",
                };
                dispatch(addAlert(alert));
                setTimeout(() => {
                    dispatch(delAlert(idAlert));
                }, 5000);
            }
        }
    };

    const {isLoaded} = useLoadScript({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: libraries,
        language: i18next.language,
    });

    const options = useMemo(
        () => ({
            disableDefaultUI: false,
            clickableIcons: false,
        }),
        []
    );

    const changePaymentType = (e) => {
        let payment = {payment_type: e}
        dispatch(changePayment(payment))
    }

    const addClient = () => {
        let client = {
            name: other_clinet_name,
            phone: other_clinet_phone
        }
        dispatch(AddClientInfo(client))
        dispatch(hideModal({show: false}))
    }

    useOnKeyPress(checkCode ? CheckCode : HandleLogin, "Enter");

    if (!isLoaded) return <Loader/>;
    return (
        <CSSTransition
            in={modalContent.show && modalContent.status !== "orders"}
            nodeRef={nodeRef}
            timeout={300}
            classNames="alert"
            unmountOnExit
        >
            <div
                className="modal-sloy">
                <div ref={nodeRef} className="modal-card">

                    {modalContent.status === "log-out" && (
                        <div className="confirm">
                            <div className="toptext">Rostdan ham profildan chiqmoqchimisz?</div>
                            <div className="btns">
                                <button
                                    className="not-out"
                                    onClick={() => dispatch(hideModal({show: false}))}
                                >
                                    Qolish
                                </button>
                                <button onClick={logOut}>Chiqish</button>
                            </div>
                        </div>
                    )}

                    {modalContent.status === "log-in" && (
                        <div className="login-box">


                            <div className="logo">
                                <img src="./images/logo2.webp" alt=""/>
                            </div>
                            <h1 className="title">
                                Xush kelibsiz!
                            </h1>
                            <p className="des">
                                Buyurtma berishingiz uchun tizimga kirishingiz talab etiladi!
                            </p>

                            <div className="label">Telefon raqamingiz:</div>

                            <PhoneInput
                                id="phone"
                                international
                                defaultCountry="UZ"
                                value={phone}
                                onChange={setPhone}
                            />

                            <button onClick={HandleLogin} disabled={phone === "" || phone === undefined}
                                    className={`next-btn ${phone === "" || phone === undefined ? "disabled" : ""}`}>
                                Davom etish
                            </button>

                        </div>
                    )}

                    {modalContent.status === "log-in-code" && (
                        <div className="login-box">
                            <h1 className="title">
                                Maxsus kodni kiriting
                            </h1>
                            <p className="des">
                                Telefon raqamingizga maxsus kod SMS tarzda yuborildi
                            </p>

                            <div className="phone-number">
                                {phone} <img onClick={() => {
                                dispatch(showModals({show: true, status: "log-in"}));
                                setCheckCode(false)
                            }} src="./images/pencil.webp"
                                             alt="edit-phone" loading="lazy"/>
                            </div>

                            <div className="inputs-verify-code">
                                <AuthCode
                                    allowedCharacters="numeric"
                                    length="5"
                                    onChange={getCodeValue}
                                />
                            </div>

                            {checkCode && seconds > 0 || minutes > 0 ? (
                                <div className="coundown">
                                    <div className="count">
                                        <img src="./images/time.png" alt=""/>
                                        {minutes < 10 ? `0${minutes}` : minutes}:
                                        {seconds < 10 ? `0${seconds}` : seconds}
                                    </div>
                                </div>
                            ) : <div onClick={HandleLogin} className="code-ref">Qayta yuborish</div>}

                            <button
                                disabled={code.trim().length < 5}
                                onClick={CheckCode}
                                className={` next-btn ${code.trim().length < 5 ? "disabled" : ""}`}
                            >
                                Kirish
                            </button>

                        </div>
                    )}

                    {modalContent.status === "download-app" && (
                        <div className="download-app">
                            <div className="cancel-btn">
                                <img
                                    onClick={() => {
                                        dispatch(hideModal({show: false}))
                                    }}
                                    src="./images/cancel.webp"
                                    alt="cancel"/>
                            </div>

                            <div className="logo">
                                <img src="./images/logo2.webp" alt=""/>
                            </div>
                            <h1 className="title">
                                O‘zingizga mos ilovani hozir yuklab oling!
                            </h1>

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
                        </div>
                    )}

                    {modalContent.status === "about-app" && (
                        <div className="about-app">
                            <div className="cancel-btn">
                                <img
                                    onClick={() => {
                                        dispatch(hideModal({show: false}))
                                    }}
                                    src="./images/cancel.webp"
                                    alt="cancel"/>
                            </div>
                            <h1 className="title">
                                Ilova haqida
                            </h1>

                            <div className="logo-card">
                                <div className="title">
                                    Ishlab chiqaruvchilar
                                </div>

                                <div className="logo">
                                    <img src="./images/logo3.webp" alt=""/>
                                </div>
                                <div className="version">1.0.1 talqin</div>
                            </div>

                            <div className="item line">
                                <div className="left">
                                    <div className="icon">
                                        <img src="./images/phone.webp" alt="phone" loading="lazy"/>
                                    </div>
                                    <div className="name">+998 99 999 99 99</div>
                                </div>
                                <div className="icon-more">
                                    <img src="./images/more.webp" alt="more" loading="lazy"/>
                                </div>
                            </div>

                            <div className="item">
                                <div className="left">
                                    <div className="icon">
                                        <img src="./images/sms.webp" alt="phone" loading="lazy"/>
                                    </div>
                                    <div className="name">Mutxasisga yozish</div>
                                </div>

                                <div className="icon-more">
                                    <img src="./images/more.webp" alt="more" loading="lazy"/>
                                </div>
                            </div>

                            <div className="social-media">
                                <div className="media">
                                    <img src="./images/youtube.webp" alt="yotube" loading="lazy"/>
                                    <div className="name">Youtube</div>
                                </div>

                                <div className="media">
                                    <img src="./images/facebook.webp" alt="yotube" loading="lazy"/>
                                    <div className="name">Facebook</div>
                                </div>

                                <div className="media">
                                    <img src="./images/telegram.webp" alt="yotube" loading="lazy"/>
                                    <div className="name">Telegram</div>
                                </div>
                            </div>

                            <div className="web-sayt">
                                © 2024 ada.taxi.uz
                            </div>
                        </div>
                    )}

                    {modalContent.status === "payment-type" && (
                        <div className="payment-type">
                            <div className="header">
                                <h1 className="title">
                                    To'lov turini tanlang
                                </h1>
                            </div>
                            <div className="radio-buttons">
                                <label className="label-payment">
                                    <div className="left">
                                        <img src="./images/card.webp" alt="card" loading="lazy"/>
                                        <span>Naqt</span>
                                    </div>


                                    <input
                                        type="radio"
                                        value="Naqt"
                                        checked={PaymentType.payment_type === "Naqt"}
                                        onChange={(e) => changePaymentType(e.target.value)}
                                        className="w-4 h-4"
                                    />
                                </label>

                                <label className="label-payment">
                                    <div className="left">
                                        <img src="./images/card.webp" alt="card" loading="lazy"/>
                                        <span>Karta</span>
                                    </div>


                                    <input
                                        type="radio"
                                        value="Karta"
                                        checked={PaymentType.payment_type === "Karta"}
                                        onChange={(e) => changePaymentType(e.target.value)}
                                        className="w-4 h-4"
                                    />

                                </label>
                            </div>

                            <div onClick={() => {
                                dispatch(hideModal({show: false}))
                            }} className="send-btn">
                                Tasdiqlash
                            </div>

                        </div>
                    )}

                    {modalContent.status === "add-other" && (
                        <div className="add-other">
                            <div className="header">
                                <h1 className="title">
                                    Kim uchun buyurtma beramiz?
                                </h1>
                                <div className="cancel-btn">
                                    <img
                                        onClick={() => {
                                            dispatch(hideModal({show: false}))
                                        }}
                                        src="./images/cancel.webp"
                                        alt="cancel"/>
                                </div>
                            </div>

                            <div className="form-box">
                                <label htmlFor="phone">Telefon raqami</label>
                                <input value={other_clinet_phone}
                                       onChange={(e) => setOtherClinetPhone(e.target.value)}
                                       id="phone"
                                       placeholder="Telefon raqam kirting..." type="number"/>
                            </div>

                            <div className="form-box">
                                <label htmlFor="name">Ismi</label>
                                <input value={other_clinet_name} onChange={(e) => setOtherClinetName(e.target.value)}
                                       id="name" placeholder="Ismini kirting..." type="text"/>
                            </div>

                            <button
                                onClick={addClient}
                                disabled={!(other_clinet_phone.trim().length > 0 && other_clinet_name.trim().length > 0)}
                                className={`send-btn ${!(other_clinet_phone.trim().length > 0 && other_clinet_name.trim().length > 0) ? "btn-disablet" : ""}`}>
                                Tasdiqlash
                            </button>
                        </div>
                    )}

                    {modalContent.status === "cancel-order" && (
                        <div className="cancel-order">
                            <div className="header">
                                <h1 className="title">
                                    Bekor qilish sababini tanlang
                                </h1>

                                <div className="cancel-btn">
                                    <img
                                        onClick={() => {
                                            dispatch(hideModal({show: false}))
                                        }}
                                        src="./images/cancel.webp"
                                        alt="cancel"/>
                                </div>
                            </div>

                            <div className="radio-buttons">
                                <label className="label-payment">
                                    <span>Rejalarim o‘zgardi</span>
                                    <input
                                        type="radio"
                                        value="1"
                                        checked={reason === "1"}
                                        onChange={(e) => setReason(e.target.value)}
                                    />
                                </label>

                                <label className="label-payment">
                                    <span>Boshqa mashina topdim</span>
                                    <input
                                        type="radio"
                                        value="2"
                                        checked={reason === "2"}
                                        onChange={(e) => setReason(e.target.value)}
                                    />
                                </label>

                                <label className="label-payment">
                                    <span>Chaqiruv nuqtasi noto‘g‘ri belgilandi</span>
                                    <input
                                        type="radio"
                                        value="3"
                                        checked={reason === "3"}
                                        onChange={(e) => setReason(e.target.value)}
                                    />
                                </label>

                                <label className="label-payment">
                                    <span>Uzoq kutish kerak edi</span>
                                    <input
                                        type="radio"
                                        value="4"
                                        checked={reason === "4"}
                                        onChange={(e) => setReason(e.target.value)}
                                    />
                                </label>

                                <label className="label-payment">
                                    <span>Haydovchi bekor qilishni so‘radi</span>
                                    <input
                                        type="radio"
                                        value="5"
                                        checked={reason === "5"}
                                        onChange={(e) => setReason(e.target.value)}
                                    />
                                </label>

                                <label className="label-payment">
                                    <div className="input-box">
                                        <input onClick={() => setReason("6")}
                                               placeholder="Bekor qilish sababini kiriting..." type="text"/>
                                    </div>

                                    <input
                                        type="radio"
                                        value="6"
                                        checked={reason === "6"}
                                        onChange={(e) => setReason(e.target.value)}
                                    />
                                </label>
                            </div>

                            <div className="send-btn">
                                Tasdiqlash
                            </div>

                        </div>
                    )}

                    {modalContent.status === "add-location" && (
                        <div className="add-location">
                            <div className="header">
                                <h1 className="title">
                                    Manzilni tanlang
                                </h1>
                                <div className="cancel-btn">
                                    <img
                                        onClick={() => {
                                            dispatch(hideModal({show: false}))
                                        }}
                                        src="./images/cancel.webp"
                                        alt="cancel"/>
                                </div>
                            </div>

                            <div className="map-box">
                                <GoogleMap
                                    zoom={10}
                                    center={center}
                                    options={options}
                                    onClick={ClicklLocation}
                                    mapContainerClassName="map"
                                >
                                    {selected && (
                                        <Marker icon={selectAddressIcon} position={selected}/>
                                    )}

                                    <div className="search-address">
                                        <div className="places-container">
                                            <PlacesAutocomplete setSelected={setSelected}/>
                                            <img src="./images/search.png" alt=""/>
                                        </div>
                                    </div>
                                </GoogleMap>
                            </div>

                            <div onClick={getAddressLocation} className="send-btn">
                                Tasdiqlash
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </CSSTransition>
    );
};
export default Modal;
