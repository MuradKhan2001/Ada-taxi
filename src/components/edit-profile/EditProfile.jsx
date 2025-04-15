import React, {useEffect, useState} from 'react';
import "./style-edit-profile.scss";
import Header from "../header/Header";
import {useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {showModals} from "../../redux/ModalContent";
import axios from "axios";
import {addAlert, delAlert} from "../../redux/AlertsBox";


const EditProfile = () => {
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
                setProfileImage(response.data.profile_image);
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
            gender,
            profile_image
        }

        axios.post(`${baseUrl}/api/v1/client/`, data, {
            headers: {
                "Authorization": `Token ${localStorage.getItem("token")}`
            }
        }).then((response) => {
            let idAlert = Date.now();
            let alert = {
                id: idAlert,
                text: "Ma'lumotlar saqlandi!",
                img: "./images/green.svg",
                color: "#FFFAEA",
            };
            dispatch(addAlert(alert));
            setTimeout(() => {
                dispatch(delAlert(idAlert));
            }, 5000);
        })
    }

    return (
        <div className="edit-profile-wrapper">
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
                            {profile_image ? "Tahrirlash" : "Rasm qo'shish"}
                        </div>
                        <input onChange={handleFileChange} type="file"/>
                    </div>

                    <div className="input-box">
                        <div className="label">Ismingiz</div>
                        <input value={first_name} onChange={(e) => setFirstName(e.target.value)} type="text"/>
                    </div>

                    <div className="input-box">
                        <div className="label">Familiyangiz</div>
                        <input value={last_name} onChange={(e) => setLastName(e.target.value)} type="text"/>
                    </div>

                    <div className="label">Jinsingiz</div>
                    <div className="on-of">
                        <div onClick={() => setGender("male")} className={`of ${gender === "male" ? "on" : ""}`}>
                            Erkak
                        </div>
                        <div onClick={() => setGender("femele")}
                             className={`of ${gender === "femele" ? "on" : ""}`}>
                            Ayol
                        </div>
                    </div>

                    <div className="buttons">
                        <div onClick={() => navigate("/profile")} className="cancel-btn">
                            Bekor qilish
                        </div>
                        <div onClick={saveProfile} className="save-btn">
                            O'zgarishlarni saqlash
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
};

export default EditProfile;