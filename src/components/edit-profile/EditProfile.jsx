import React from 'react';
import "./style-profile.scss";
import Header from "../header/Header";
import {useNavigate} from "react-router-dom";
import {useDispatch} from "react-redux";
import {showModals} from "../../redux/ModalContent";


const Profile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

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
                        <img src="./images/camera.webp" alt="photo" loading="lazy"/>
                    </div>

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

                    <div className="contacts">
                        <div className="item">
                            <div className="label">Telefon raqam</div>
                            <div className="info">+998 99 999 99 99</div>
                        </div>

                        <div className="line"></div>

                        <div className="item">
                            <div className="label">Ro'yxatga olingan sana:</div>
                            <div className="info">01.02.2025</div>
                        </div>
                    </div>

                    <div className="buttons">
                        <div className="item">
                            <img src="./images/edit.webp" alt="edit" loading="lazy"/>
                            Tahrirlash
                        </div>
                        <div className="line"></div>

                        <div onClick={() => showModalContent("log-out")} className="item">
                            <img src="./images/log-out-user.webp" alt="log-out" loading="lazy"/>
                            Profildan chiqish
                        </div>
                    </div>

                </div>


            </div>
        </div>
    );
};

export default Profile;