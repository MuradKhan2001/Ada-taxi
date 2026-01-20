import "./header-style-mobile.scss";
import {useTranslation} from "react-i18next";
import {useDispatch, useSelector} from "react-redux";
import {showModals} from "../../redux/ModalContent";
import {useNavigate} from "react-router-dom";
import React, {useEffect, useState} from "react";
import axios from "axios";
import {addAlert, delAlert} from "../../redux/AlertsBox";
import {hide} from "../../redux/ShowMenu";

const HeaderMobile = () => {
    const baseUrl = useSelector((store) => store.baseUrl.data)
    const navigate = useNavigate();
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const [client, setClient] = useState({});
    const [profile_info, setProfileInfo] = useState({});
    const [myCode, setMyCode] = useState("");

    useEffect(() => {
        if (localStorage.getItem("token")) {

            axios.get(`${baseUrl}/api/v1/client/`, {
                headers: {
                    "Authorization": `Token ${localStorage.getItem("token")}`
                }
            }).then((response) => {
                setProfileInfo(response.data);
            }).catch((error) => {
                if (error.response.status == 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("userId");
                    showModalContent("log-in")
                }
            })

            axios.get(`${baseUrl}/api/v1/mycode/`, {
                headers: {
                    "Authorization": `Token ${localStorage.getItem("token")}`
                }
            }).then((response) => {
                setMyCode(response.data.code);
            })
        }
    }, []);

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

    const showModalContent = (status) => {
        dispatch(showModals({show: true, status: status}));
    };

    useEffect(() => {
        if (localStorage.getItem("token")) {
            axios.get(`${baseUrl}/api/v1/client/`, {
                headers: {
                    "Authorization": `Token ${localStorage.getItem("token")}`
                }
            }).then((response) => {
                setClient(response.data);
            }).catch((error) => {
                if (error.response.status == 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("userId");
                    showModalContent("log-in")
                }
            });
        }
    }, []);

    return (
        <div className="header-wrapper-mobile">
            <div className="header-buttons">
                <div className="information-profile">
                    <div className="photo-client">
                        {profile_info.profile_image ?
                            <img src={profile_info.profile_image} alt="photo" loading="lazy"/> :
                            <img src="./images/user.webp" alt="person" loading="lazy"/>}
                    </div>
                    <div className="name">
                        {profile_info.first_name}
                        &ensp;
                        {profile_info.last_name}
                    </div>
                    <div className="contact">
                        <div className="info">{profile_info.phone}</div>
                    </div>

                    <div className="information">
                        <div className="rate">
                            <div className="label">{t("rate")}</div>
                            <div className="info">
                                <img src="./images/star.webp" alt="star" loading="lazy"/>
                                {profile_info.rate}
                            </div>
                        </div>
                        <div className="line"></div>
                        <div className="count">
                            <div className="label">{t("orders_finishet")}</div>
                            <div className="info">
                                {profile_info.finished_orders_count}
                            </div>
                        </div>
                        <div className="line"></div>

                        <div className="lef-code">
                            <div className="label">{t("your_code")}</div>
                            <div className="your-code">
                                {myCode}
                                <img onClick={handleCopy} src="./images/copy.png" alt="copy"/>
                            </div>
                        </div>

                    </div>

                    <div className="buttons">
                        <div onClick={() => {
                            navigate("/edit-profile")
                            dispatch(hide({show: false}))
                        }} className="item">
                            <img src="./images/edit.webp" alt="edit" loading="lazy"/>
                            {t("edit")}
                        </div>
                        <div className="line"></div>

                        <div onClick={() => {
                            showModalContent("log-out")
                            dispatch(hide({show: false}))
                        }} className="item">
                            <img src="./images/log-out-user.webp" alt="log-out" loading="lazy"/>
                            {t("logOut")}
                        </div>
                    </div>
                </div>
            </div>

            <div className="center-box">
                <div className="menu-item" onClick={() => {
                    showModalContent("orders")
                    navigate("/")
                    dispatch(hide({show: false}))
                }}>
                    <img src="./images/history.png" alt=""/>
                    {t("my_orders")}
                </div>

                <div className="menu-item" onClick={() => {
                    showModalContent("about-app")
                    dispatch(hide({show: false}))
                }}>
                    <img src="./images/call.png" alt=""/>
                    {t("app_links")}
                </div>

                <div className="menu-item" onClick={() => {
                    showModalContent("download-app")
                    dispatch(hide({show: false}))
                }}>
                    <img src="./images/app.png" alt=""/>
                    {t("download_app")}
                </div>
            </div>
        </div>
    );
};

export default HeaderMobile;