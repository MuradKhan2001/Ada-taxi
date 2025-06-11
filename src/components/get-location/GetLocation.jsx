import React, {useRef, useState, useMemo, useEffect} from "react";
import {CSSTransition} from "react-transition-group";
import {useSelector, useDispatch} from "react-redux";
import axios from "axios";
import {GoogleMap, Marker, MarkerF, useLoadScript} from "@react-google-maps/api";
import {Combobox, ComboboxInput, ComboboxOption} from "@reach/combobox";
import i18next from "i18next";
import {GOOGLE_MAPS_API_KEY} from "./googleMapsApi";
import {addAlert, delAlert} from "../../redux/AlertsBox";
import {updateDropLocationPickUp} from "../../redux/PickUpLocations";
import {updateDropLocationDrop} from "../../redux/DropOffLocations";
import {useTranslation} from "react-i18next";
import usePlacesAutocomplete, {getGeocode, getLatLng} from "use-places-autocomplete";
import "@reach/combobox/styles.css";
import Loader from "../loader/Loader";
import "./style.scss";
import {ShowHideModal} from "../../redux/GetLocations";

const libraries = ["places"];

const GetLocation = () => {
    const {t} = useTranslation();
    const nodeRef = useRef(null);
    const dispatch = useDispatch();
    const GetLocations = useSelector((store) => store.GetLocations.data);
    const PickUpLocations = useSelector((store) => store.PickUpLocations.data)
    const DropOffLocations = useSelector((store) => store.DropOffLocations.data)
    const [center, setCenter] = useState(null);
    const [searchLocationAddress, setSearchLocationAddress] = useState("");
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            const {latitude, longitude} = position.coords;
            let locMy = {lat: latitude, lng: longitude};
            setCenter(locMy);
        });

        if (GetLocations.location_status === "pick_up") {
            if (PickUpLocations[GetLocations.location_num].address) {
                let locMy = {
                    lat: PickUpLocations[GetLocations.location_num].latitude,
                    lng: PickUpLocations[GetLocations.location_num].longitude
                };
                setCenter(locMy);
                setSelected(locMy)
                setSearchLocationAddress(PickUpLocations[GetLocations.location_num].address)
            } else {
                navigator.geolocation.getCurrentPosition((position) => {
                    const {latitude, longitude} = position.coords;
                    let locMy = {lat: latitude, lng: longitude};
                    setCenter(locMy);
                });
            }
        }

        if (GetLocations.location_status === "drop_off") {
            if (DropOffLocations[GetLocations.location_num].address) {
                let locMy = {
                    lat: DropOffLocations[GetLocations.location_num].latitude,
                    lng: DropOffLocations[GetLocations.location_num].longitude
                };
                setCenter(locMy);
                setSelected(locMy)
                setSearchLocationAddress(DropOffLocations[GetLocations.location_num].address)
            } else {
                navigator.geolocation.getCurrentPosition((position) => {
                    const {latitude, longitude} = position.coords;
                    let locMy = {lat: latitude, lng: longitude};
                    setCenter(locMy);
                });
            }
        }

    }, [GetLocations.show === true]);

    const selectAddressIcon = {
        url: "./images/address.png",
        scaledSize: {width: 40, height: 50},
    };
    const selectAddressMyIcon = {
        url: "./images/my-loc.png",
        scaledSize: {width: 40, height: 40},
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

            axios.get(`${url}`, {
                    headers: {
                        "Accept-Language": i18next.language,
                    },
                }).then((res) => {
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
                        if (GetLocations.location_status === "pick_up") {
                            setSearchLocationAddress(fullAddress);
                            setSelected(locMy);
                            setCenter({lat, lng});
                            setValue(address, false);
                            clearSuggestions();
                        } else if (GetLocations.location_status === "drop_off") {
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
                    if (GetLocations.location_status === "pick_up") {
                        setSearchLocationAddress(fullAddress);
                        setSelected(locMy);
                    } else if (GetLocations.location_status === "drop_off") {
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
        if (GetLocations.location_status === "pick_up") {
            if (searchLocationAddress && selected) {
                dispatch(updateDropLocationPickUp({
                    index: Number(GetLocations.location_num),
                    newData: {
                        address: searchLocationAddress,
                        latitude: Number(selected.lat.toString().slice(0, 9)),
                        longitude: Number(selected.lng.toString().slice(0, 9))
                    }
                }));
                dispatch(ShowHideModal({show: false}))
                setSelected(null);
                setSearchLocationAddress("")
            } else {
                let idAlert = Date.now();
                let alert = {
                    id: idAlert,
                    text: t("alert7"),
                    img: "./images/red.svg",
                    color: "#FFEDF1",
                };
                dispatch(addAlert(alert));
                setTimeout(() => {
                    dispatch(delAlert(idAlert));
                }, 5000);
            }
        }
        if (GetLocations.location_status === "drop_off") {
            if (searchLocationAddress && selected) {
                dispatch(updateDropLocationDrop({
                    index: Number(GetLocations.location_num),
                    newData: {
                        address: searchLocationAddress,
                        latitude: Number(selected.lat.toString().slice(0, 9)),
                        longitude: Number(selected.lng.toString().slice(0, 9))
                    }
                }));
                dispatch(ShowHideModal({show: false}))
                setSelected(null);
                setSearchLocationAddress("")
            } else {
                let idAlert = Date.now();
                let alert = {
                    id: idAlert,
                    text: t("alert7"),
                    img: "./images/red.svg",
                    color: "#FFEDF1",
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

    if (!isLoaded) return <Loader/>;
    return (
        <CSSTransition
            in={GetLocations.show}
            nodeRef={nodeRef}
            timeout={300}
            classNames="alert"
            unmountOnExit
        >
            <div
                className="modal-sloy">
                <div ref={nodeRef} className="modal-card">
                    <div className="add-location">
                        <div className="header">
                            <h1 className="title">
                                {t("choose_location")}
                            </h1>
                            <div className="cancel-btn">
                                <img
                                    onClick={() => {
                                        dispatch(ShowHideModal({show: false}))
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

                                {center && (
                                    <MarkerF
                                        position={center}
                                        icon={selectAddressMyIcon}
                                    />)}

                                <div className="search-address">
                                    <div className="places-container">
                                        <PlacesAutocomplete setSelected={setSelected}/>
                                        <img src="./images/search.png" alt=""/>
                                    </div>
                                </div>
                            </GoogleMap>
                        </div>

                        <div onClick={getAddressLocation} className="send-btn">
                            {t("success")}
                        </div>
                    </div>
                </div>
            </div>
        </CSSTransition>
    );
};
export default GetLocation;
