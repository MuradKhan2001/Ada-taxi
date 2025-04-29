import React, {useEffect, useState} from 'react';
import "./style-profile.scss";
import Header from "../header/Header";
import {useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {showModals} from "../../redux/ModalContent";
import axios from "axios";
import {useTranslation} from "react-i18next";


const Profile = () => {
    const {t} = useTranslation();
    const baseUrl = useSelector((store) => store.baseUrl.data)
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [profile_info, setProfileInfo] = useState({});

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
        }
    }, []);

    const showModalContent = (status) => {
        dispatch(showModals({show: true, status: status}));
    };

    return (
        <div className="profile-wrapper">
            <div className="top-side">
                <Header/>
            </div>
            <div className="bottom-side">
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
                    </div>
                    <div className="contacts">
                        <div className="item">
                            <div className="label">{t("my_phone")}</div>
                            <div className="info">{profile_info.phone}</div>
                        </div>

                        {/*<div className="line"></div>*/}

                        {/*<div className="item">*/}
                        {/*    <div className="label">Ro'yxatga olingan sana:</div>*/}
                        {/*    <div className="info">01.02.2025</div>*/}
                        {/*</div>*/}
                    </div>
                    <div className="buttons">
                        <div onClick={() => navigate("/edit-profile")} className="item">
                            <img src="./images/edit.webp" alt="edit" loading="lazy"/>
                            {t("edit")}
                        </div>
                        <div className="line"></div>

                        <div onClick={() => showModalContent("log-out")} className="item">
                            <img src="./images/log-out-user.webp" alt="log-out" loading="lazy"/>
                            {t("logOut")}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;