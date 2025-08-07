import Dropdown from 'react-bootstrap/Dropdown';
import "./header-style.scss"
import i18next from "i18next";
import {useTranslation} from "react-i18next";
import {useDispatch, useSelector} from "react-redux";
import {showModals} from "../../redux/ModalContent";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";

const Header = () => {
    const baseUrl = useSelector((store) => store.baseUrl.data)
    const navigate = useNavigate();
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const [client, setClient] = useState({});

    const language = [
        {
            code: "uz",
            name: "O'zbek tili",
            country_code: "uz",
        },
        {
            code: "en",
            name: "English language",
            country_code: "en",
        },
        {
            code: "ru",
            name: "Pусский язык",
            country_code: "ru",
        },
    ];
    const changeLanguage = (code) => {
        localStorage.setItem("lng", code);
        i18next.changeLanguage(code);
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
        <div className="header-wrapper">
            <img onClick={() => navigate("/")} className="logo" src="./images/logo.webp" alt="ada-taxi-logo"
                 loading="lazy"/>
            <div className="center-box">
                <b onClick={() => {
                    showModalContent("orders")
                    navigate("/")
                }}>
                    {t("my_orders")}
                </b>

                <b onClick={() => showModalContent("about-app")}>
                    {t("app_links")}
                </b>

                <b onClick={() => showModalContent("download-app")}>
                    {t("download_app")}
                </b>

                <b onClick={() => showModalContent("news")}>
                    {t("news")}
                </b>
            </div>
            <div className="header-buttons">
                <div className="language-btn">
                    <Dropdown>
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                            <img className="globe" src="./images/globe-alt.webp" alt="language" loading="lazy"/>
                            <div className="name">
                                {language.map((item, index) => {
                                    return (
                                        <div key={index}>
                                            {i18next.language === item.code ? item.name : ""}
                                        </div>
                                    );
                                })}
                            </div>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>

                            {language.map(({code, name, country_code}) => (
                                <Dropdown.Item key={country_code}
                                               onClick={() => changeLanguage(code)}>{name}</Dropdown.Item>
                            ))}

                        </Dropdown.Menu>
                    </Dropdown>
                </div>
                {!localStorage.getItem("token") &&
                    <div onClick={() => showModalContent("log-in")} className="sign-in-btn">
                        <img src="./images/logout.webp" alt="sign-in" loading="lazy"/>
                        {t("login")}
                    </div>}
                {localStorage.getItem("token") && <div className="profile-client">
                    <Dropdown>
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                            <div className="image-person">
                                <img
                                    src={client.profile_image || "./images/user.webp"}
                                    alt="photo"
                                    loading="lazy"
                                />
                            </div>

                            <div className="info-person">
                                <div className="name">{client.first_name}&ensp;{client.last_name}</div>
                                <div className="phone">{client.phone}</div>
                            </div>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => navigate("/profile")}>
                                <img src="./images/setting.webp" alt="settings" loading="lazy"/>
                                {t("settings")}
                            </Dropdown.Item>

                            <Dropdown.Item onClick={() => showModalContent("about-app")}>
                                <img src="./images/information.webp" alt="settings" loading="lazy"/>
                                {t("app_links")}
                            </Dropdown.Item>

                            <Dropdown.Item onClick={() => showModalContent("log-out")}>
                                <img src="./images/log-out.webp" alt="settings" loading="lazy"/>
                                {t("logOut")}
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>}
            </div>
        </div>
    );
};

export default Header;