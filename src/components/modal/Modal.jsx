import React, {useRef, useState, useEffect, useContext} from "react";
import {CSSTransition} from "react-transition-group";
import {useSelector, useDispatch} from "react-redux";
import {hideModal, showModals} from "../../redux/ModalContent";
import PhoneInput from "react-phone-number-input";
import AuthCode from "react-auth-code-input";
import axios from "axios";
import {useOnKeyPress} from "./useOnKeyPress";
import "./style.scss";
import {addAlert, delAlert} from "../../redux/AlertsBox";
import {AddClientInfo} from "../../redux/AddClient";
import {changePayment} from "../../redux/PaymentType";
import {useTranslation} from "react-i18next";
import "@reach/combobox/styles.css";
import {webSockedContext} from "../app/App";
import i18next from "i18next";

const Modal = () => {
    let webSocked = useContext(webSockedContext);
    const {t} = useTranslation();
    const nodeRef = useRef(null);
    const baseUrl = useSelector((store) => store.baseUrl.data);
    const dispatch = useDispatch();
    const modalContent = useSelector((store) => store.ModalContent.data);
    const PaymentType = useSelector((store) => store.PaymentType.data)
    const [RefCode, setRefCode] = useState("");

    const [phone, setPhone] = useState("");
    const [code, setCode] = useState("");
    const [checkCode, setCheckCode] = useState(false);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(60);
    const [reason, setReason] = useState(0);
    const [reasonList, setReasonList] = useState([]);
    const [other_clinet_phone, setOtherClinetPhone] = useState("");
    const [other_clinet_name, setOtherClinetName] = useState("");

    const [newsList, setNewsList] = useState([]);
    const [discountList, setDiscountList] = useState([]);

    const [myCode, setMyCode] = useState("");

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
        if (localStorage.getItem("token")) {
            axios.get(`${baseUrl}/api/v1/reject-reason/client/`, {
                headers: {
                    "Authorization": `Token ${localStorage.getItem("token")}`
                }
            }).then((response) => {
                setReasonList(response.data);
            })

            axios.get(`${baseUrl}/api/v1/mycode/`, {
                headers: {
                    "Authorization": `Token ${localStorage.getItem("token")}`
                }
            }).then((response) => {
                setMyCode(response.data.code);
            })

            axios.get(`${baseUrl}/api/v1/news/`, {
                headers: {
                    "Authorization": `Token ${localStorage.getItem("token")}`
                }
            }).then((response) => {
                setNewsList(response.data);
            })

            axios.get(`${baseUrl}/api/v1/my-discount/`, {
                headers: {
                    "Authorization": `Token ${localStorage.getItem("token")}`
                }
            }).then((response) => {
                setDiscountList(response.data);
            })

        }
    }, []);

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
                            text: t("error_phone"),
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
        axios.post(`${baseUrl}/api/v1/auth/verify_code/`, {
            user: localStorage.getItem("userId"),
            code: code,
            role: "client"
        })
            .then((response) => {
                localStorage.setItem("token", response.data.token);
                axios.get(`${baseUrl}/api/v1/client/`, {
                    headers: {
                        "Authorization": `Token ${response.data.token}`
                    }
                }).then((response) => {
                    if (response.data.first_name && response.data.last_name) {
                        dispatch(hideModal({show: false}))
                        window.location.reload();
                    } else {
                        dispatch(showModals({show: true, status: "referal-code"}));
                        axios.get(`${baseUrl}/api/v1/mycode/`, {
                            headers: {
                                "Authorization": `Token ${localStorage.getItem("token")}`
                            }
                        }).then((response) => {
                            setMyCode(response.data.code);
                        })
                    }

                })

            })
            .catch((error) => {
                if (error.response.status === 400) {
                    if (error.response.data.code === -12) {
                        let idAlert = Date.now();
                        let alert = {
                            id: idAlert,
                            text: t("error_code"),
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

    const cencelOrder = () => {
        webSocked(modalContent.id, reason)
    }

    const checkRefCode = () => {
        axios.post(`${baseUrl}/api/v1/revoke-code/`, {code: RefCode}, {
            headers: {
                "Authorization": `Token ${localStorage.getItem("token")}`
            }
        }).then((response) => {
            dispatch(hideModal({show: false}))
            let idAlert = Date.now();
            let alert = {
                id: idAlert,
                text: t("referal_alert1"),
                img: "./images/green.svg",
                color: "#EDFFFA",
            };
            dispatch(addAlert(alert));
            setTimeout(() => {
                dispatch(delAlert(idAlert));
                window.location.pathname = "/edit-profile";
            }, 5000);
        }).catch((error) => {
            if (error.response.data.code === -37) {
                let idAlert = Date.now();
                let alert = {
                    id: idAlert,
                    text: t("referal_alert2"),
                    img: "./images/red.svg",
                    color: "#ffeaea",
                };
                dispatch(addAlert(alert));
                setTimeout(() => {
                    dispatch(delAlert(idAlert));
                }, 5000);
            }

            if (error.response.data.code === -38) {
                let idAlert = Date.now();
                let alert = {
                    id: idAlert,
                    text: t("referal_alert3"),
                    img: "./images/red.svg",
                    color: "#ffeaea",
                };
                dispatch(addAlert(alert));
                setTimeout(() => {
                    dispatch(delAlert(idAlert));
                }, 5000);
            }

            if (error.response.data.code === -39) {
                let idAlert = Date.now();
                let alert = {
                    id: idAlert,
                    text: t("referal_alert4"),
                    img: "./images/red.svg",
                    color: "#ffeaea",
                };
                dispatch(addAlert(alert));
                setTimeout(() => {
                    dispatch(delAlert(idAlert));
                }, 5000);
            }
        });


    }

    const handleCopy = () => {
        if (myCode) {
            navigator.clipboard.writeText(myCode)
                .then(() => {
                    let idAlert = Date.now();
                    let alert = {
                        id: idAlert,
                        text: t("referal_alert5"),
                        img: "./images/green.svg",
                        color: "#EDFFFA",
                    };
                    dispatch(addAlert(alert));
                    setTimeout(() => {
                        dispatch(delAlert(idAlert));
                    }, 5000);
                })
        }
    };

    useOnKeyPress(checkCode ? CheckCode : HandleLogin, "Enter");

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
                            <div className="toptext">{t("log_out_text1")}</div>
                            <div className="btns">
                                <button
                                    className="not-out"
                                    onClick={() => dispatch(hideModal({show: false}))}
                                >
                                    {t("log_out_text2")}
                                </button>
                                <button onClick={logOut}>
                                    {t("log_out_text3")}
                                </button>
                            </div>
                        </div>
                    )}

                    {modalContent.status === "log-in" && (
                        <div className="login-box">
                            <div className="logo">
                                <img src="./images/logo2.webp" alt=""/>
                            </div>
                            <h1 className="title">
                                {t("login_text")}
                            </h1>
                            <p className="des">
                                {t("login_des")}
                            </p>
                            <div className="label">{t("login_phone")}</div>
                            <PhoneInput
                                id="phone"
                                international
                                defaultCountry="UZ"
                                value={phone}
                                onChange={setPhone}
                            />

                            <button onClick={HandleLogin} disabled={phone === "" || phone === undefined}
                                    className={`next-btn ${phone === "" || phone === undefined ? "disabled" : ""}`}>
                                {t("next")}
                            </button>
                        </div>
                    )}

                    {modalContent.status === "log-in-code" && (
                        <div className="login-box">
                            <h1 className="title">
                                {t("enter_code")}
                            </h1>
                            <p className="des">
                                {t("enter_code2")}
                            </p>
                            <div className="phone-number">
                                {phone} <img onClick={() => {
                                dispatch(showModals({show: true, status: "log-in"}));
                                setCheckCode(false)
                            }} src="./images/pencil.webp" alt="edit-phone" loading="lazy"/>
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
                            ) : <div onClick={HandleLogin} className="code-ref">{t("enter_code3")}</div>}

                            <button
                                disabled={code.trim().length < 5}
                                onClick={CheckCode}
                                className={` next-btn ${code.trim().length < 5 ? "disabled" : ""}`}
                            >
                                {t("login")}
                            </button>
                        </div>
                    )}

                    {modalContent.status === "referal-code" && (
                        <div className="referal-code">
                            <div className="logo">
                                <img src="./images/logo2.webp" alt=""/>
                            </div>
                            <h1 className="title">
                                {t("login_text_referal")}
                            </h1>
                            <p className="des">
                                {t("login_des_referal")}
                            </p>

                            <div className="label">{t("your_code")}</div>
                            <div className="your-code">
                                {myCode}
                                <img onClick={handleCopy} src="./images/copy.png" alt="copy"/>
                            </div>

                            <div className="label">{t("friend_code")}</div>
                            <input value={RefCode} onChange={(e) => setRefCode(e.target.value)}
                                   placeholder={t("friend_input")}
                                   type="text"/>

                            <button onClick={checkRefCode} disabled={RefCode === ""}
                                    className={`next-btn ${RefCode === "" ? "disabled" : ""}`}>
                                {t("referal_button")}
                            </button>

                            <div onClick={() => {
                                window.location.pathname = "/edit-profile";
                                dispatch(hideModal({show: false}))
                            }} className="skip-button">
                                {t("skip_button")} >
                            </div>
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
                                {t("title_apps")}
                            </h1>
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
                                <a target="_blank"
                                   href="https://play.google.com/store/apps/details?id=uz.adataxi.client"
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
                                {t("app_links")}
                            </h1>
                            <div className="logo-card">
                                <div className="logo">
                                    <img src="./images/logo3.webp" alt=""/>
                                </div>
                            </div>
                            <a href="tel:+998915444499">
                                <div className="item line">
                                    <div className="left">
                                        <div className="icon">
                                            <img src="./images/phone.webp" alt="phone" loading="lazy"/>
                                        </div>
                                        <div className="name">
                                            +998 91 544 44 99
                                        </div>
                                    </div>
                                    <div className="icon-more">
                                        <img src="./images/more.webp" alt="more" loading="lazy"/>
                                    </div>
                                </div>
                            </a>
                            <a target="_blank" href="https://t.me/adataxi_admin">
                                <div className="item">
                                    <div className="left">
                                        <div className="icon">
                                            <img src="./images/sms.webp" alt="phone" loading="lazy"/>
                                        </div>
                                        <div className="name">
                                            {t("send-message")}
                                        </div>
                                    </div>
                                    <div className="icon-more">
                                        <img src="./images/more.webp" alt="more" loading="lazy"/>
                                    </div>
                                </div>
                            </a>
                            <div className="social-media">
                                <div className="media">
                                    <a target="_blank" href="https://www.instagram.com/adataxi_uz/">
                                        <img src="./images/instagram.png" alt="instagram" loading="lazy"/>
                                    </a>

                                    <div className="name">Facebook</div>
                                </div>

                                <div className="media">
                                    <a target="_blank" href="https://t.me/+Ruz2cjoeIC4xNTU6">
                                        <img src="./images/telegram.webp" alt="yotube" loading="lazy"/>
                                    </a>
                                    <div className="name">Telegram</div>
                                </div>

                                <div className="media">
                                    <a target="_blank" href="https://www.youtube.com/@AdaTaxi">
                                        <img src="./images/youtube.webp" alt="yotube" loading="lazy"/>
                                    </a>
                                    <div className="name">Youtube</div>
                                </div>
                            </div>
                            <div className="web-sayt">
                                <a target="_blank" href="https://adataxi.uz/">
                                    © 2024 adataxi.uz</a>
                            </div>
                        </div>
                    )}

                    {modalContent.status === "payment-type" && (
                        <div className="payment-type">
                            <div className="header">
                                <h1 className="title">
                                    {t("payment_type")}
                                </h1>
                            </div>
                            <div className="radio-buttons">
                                <label className="label-payment">
                                    <div className="left">
                                        <img src="./images/wallet.png" alt="card" loading="lazy"/>
                                        <span>{t("cash")}</span>
                                    </div>
                                    <input
                                        type="radio"
                                        value="cash"
                                        checked={PaymentType.payment_type === "cash"}
                                        onChange={(e) => changePaymentType(e.target.value)}
                                        className="w-4 h-4"
                                    />
                                </label>
                                <label className="label-payment">
                                    <div className="left">
                                        <img src="./images/card.webp" alt="card" loading="lazy"/>
                                        <span>{t("card")}</span>
                                    </div>
                                    <input
                                        type="radio"
                                        value="card"
                                        checked={PaymentType.payment_type === "card"}
                                        onChange={(e) => changePaymentType(e.target.value)}
                                        className="w-4 h-4"
                                    />

                                </label>
                            </div>

                            <div onClick={() => {
                                dispatch(hideModal({show: false}))
                            }} className="send-btn">
                                {t("success")}
                            </div>
                        </div>
                    )}

                    {modalContent.status === "add-other" && (
                        <div className="add-other">
                            <div className="header">
                                <h1 className="title">
                                    {t("other-order")}
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
                                <label htmlFor="phone">{t("phone")}</label>
                                <input value={other_clinet_phone}
                                       onChange={(e) => setOtherClinetPhone(e.target.value)}
                                       id="phone"
                                       placeholder={t("phone_form")} type="number"/>
                            </div>
                            <div className="form-box">
                                <label htmlFor="name">{t("name")}</label>
                                <input value={other_clinet_name} onChange={(e) => setOtherClinetName(e.target.value)}
                                       id="name" placeholder={t("name_add")} type="text"/>
                            </div>
                            <button
                                onClick={addClient}
                                disabled={!(other_clinet_phone.trim().length > 0 && other_clinet_name.trim().length > 0)}
                                className={`send-btn ${!(other_clinet_phone.trim().length > 0 && other_clinet_name.trim().length > 0) ? "btn-disablet" : ""}`}>
                                {t("success")}
                            </button>
                        </div>
                    )}

                    {modalContent.status === "cancel-order" && (
                        <div className="cancel-order">
                            <div className="header">
                                <h1 className="title">
                                    {t("reason_cancel")}
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
                                {reasonList.map((item, index) => {
                                    return <label key={item.id} className="label-payment">
                                        <span>{item.translations[i18next.language].name}</span>
                                        <input
                                            type="radio"
                                            value={item.id}
                                            checked={reason === item.id}
                                            onChange={() => {
                                                setReason(item.id)
                                            }}
                                        />
                                    </label>
                                })}

                                {/*<label className="label-payment">*/}
                                {/*    <div className="input-box">*/}
                                {/*        <input onClick={() => setReason("6")}*/}
                                {/*               placeholder="Bekor qilish sababini kiriting..." type="text"/>*/}
                                {/*    </div>*/}

                                {/*    <input*/}
                                {/*        type="radio"*/}
                                {/*        value="6"*/}
                                {/*        checked={reason === "6"}*/}
                                {/*        onChange={(e) => setReason(e.target.value)}*/}
                                {/*    />*/}
                                {/*</label>*/}
                            </div>

                            <div onClick={cencelOrder} className="send-btn">
                                {t("success")}
                            </div>
                        </div>
                    )}

                    {modalContent.status === "news" && (
                        <div className="news">
                            <div className="cancel-btn">
                                <img
                                    onClick={() => {
                                        dispatch(hideModal({show: false}))
                                    }}
                                    src="./images/cancel.webp"
                                    alt="cancel"/>
                            </div>
                            <h1 className="title">
                                {t("news")}
                            </h1>

                            {discountList.length > 0 && <div className="discount-box">
                                <div className="discount-title">
                                    {t("discount-name")}
                                </div>
                                {discountList.map((item, index) => {
                                    return <div key={index} className="discount-card">
                                        <div className="date">
                                            {item.created_at}
                                        </div>
                                        <div className="title-dis"><span>10%</span>
                                            {t("discount-count")}
                                        </div>
                                        <div className="desc-dis">
                                            {t("discount-title")}
                                            <div className="info">
                                                {t("discount-main-title")}
                                            </div>
                                        </div>
                                    </div>
                                })}
                            </div>}

                            {newsList.length > 0 && <div className="news-box">
                                <div className="discount-title">
                                    {t("news-title")}
                                </div>
                                {newsList.map((item, index) => {
                                    return <div key={index} className="discount-card">
                                        <div className="date">
                                            {item.created_at}
                                        </div>
                                        <div className="title-dis">{item.translations[i18next.language].title}</div>
                                        <div className="desc-dis">
                                            {item.translations[i18next.language].content}
                                        </div>
                                    </div>
                                })}
                            </div>}

                            {newsList.length === 0 && discountList.length === 0 && <div className="no-news">
                                {t("empty-news")}
                            </div>}
                        </div>
                    )}
                </div>
            </div>
        </CSSTransition>
    );
};
export default Modal;
