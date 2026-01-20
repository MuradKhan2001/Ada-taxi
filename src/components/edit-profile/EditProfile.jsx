import React, {useEffect, useState} from 'react';
import "./style-edit-profile.scss";
import Header from "../header/Header";
import {useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {showModals} from "../../redux/ModalContent";
import axios from "axios";
import {addAlert, delAlert} from "../../redux/AlertsBox";
import {useTranslation} from "react-i18next";
import {Helmet} from "react-helmet";
import {useMediaQuery} from "@mui/material";


const EditProfile = () => {
    const isMobile = useMediaQuery("(max-width: 1024px)");
    const {t} = useTranslation();
    const baseUrl = useSelector((store) => store.baseUrl.data)
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [profile_image, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [first_name, setFirstName] = useState("");
    const [last_name, setLastName] = useState("");
    const [gender, setGender] = useState("male");
    useEffect(() => {
        if (localStorage.getItem("token")) {
            axios.get(`${baseUrl}/api/v1/client/`, {
                headers: {
                    "Authorization": `Token ${localStorage.getItem("token")}`
                }
            }).then((response) => {
                setFirstName(response.data.first_name);
                setLastName(response.data.last_name);
                setGender(response.data.gender);
                setImagePreview(response.data.profile_image);
            }).catch((error) => {
                if (error.response.status == 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("userId");
                    showModalContent("log-in")
                }
            })
        }
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const showModalContent = (status) => {
        dispatch(showModals({show: true, status: status}));
    };

    const saveProfile = () => {
        let data = {
            first_name,
            last_name,
            gender
        }

        let formData = new FormData();
        for (let key in data) {
            formData.append(key, data[key]);
        }

        if (profile_image) {
            formData.append("profile_image", profile_image);
        }

        axios.post(`${baseUrl}/api/v1/client/`, formData, {
            headers: {
                "Authorization": `Token ${localStorage.getItem("token")}`
            }
        }).then((response) => {
            let idAlert = Date.now();
            let alert = {
                id: idAlert,
                text: t("save_info"),
                img: "./images/green.svg",
                color: "#EDFFFA",
            };
            dispatch(addAlert(alert));
            setTimeout(() => {
                dispatch(delAlert(idAlert));
            }, 5000);
        })


    }

    return (
        <div className="edit-profile-wrapper">
            <Helmet>
                <title>{t("home-title")}</title>
                <meta name="description"
                      content={t("home-des")}/>
            </Helmet>
            <div className="top-side">
                <Header/>
            </div>
            <div className="bottom-side">
                <div className="information-profile">
                    <div className="photo-client">
                        <img
                            src={imagePreview || "./images/camera.webp"}
                            alt="photo"
                            loading="lazy"
                        />
                    </div>
                    <div className="choose-img">
                        <div className="text">
                            {profile_image ? t("edit") : t("add_photo")}
                        </div>
                        <input onChange={handleFileChange} type="file"/>
                    </div>
                    <div className="input-box">
                        <div className="label">{t("first_name")}</div>
                        <input value={first_name} onChange={(e) => setFirstName(e.target.value)} type="text"/>
                    </div>
                    <div className="input-box">
                        <div className="label">{t("last_name")}</div>
                        <input value={last_name} onChange={(e) => setLastName(e.target.value)} type="text"/>
                    </div>
                    <div className="label">{t("gender")}</div>
                    <div className="on-of">
                        <div onClick={() => setGender("male")} className={`of ${gender === "male" ? "on" : ""}`}>
                            {t("male")}
                        </div>
                        <div onClick={() => setGender("female")}
                             className={`of ${gender === "female" ? "on" : ""}`}>
                            {t("female")}
                        </div>
                    </div>
                    <div className="buttons">
                        <div onClick={() => {
                            isMobile ? navigate("/") : navigate("/profile")
                        }} className="cancel-btn">
                            {t("cancel_order")}
                        </div>
                        <div onClick={saveProfile} className="save-btn">
                            {t("save_information")}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;