import { useRef, useState, useContext, useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import { useSelector, useDispatch } from "react-redux";
import ReactStars from "react-stars";
import { hideModal, showModals } from "../../redux/ModalContent";
import "./style.scss";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { webSockedContext } from "../app/App";
import { getOrders } from "../../redux/Orders";
import { addRaidDriver } from "../../redux/RaidDriver";
import { delAlert, addAlert } from "../../redux/AlertsBox";
import i18next from "i18next";
import error from "./sound/error.mp3";

const Modal = () => {
  const baseUrl = useSelector((store) => store.baseUrl.data);
  const modalContent = useSelector((store) => store.ModalContent.data);
  const activeOrders = useSelector((store) => store.Orders.activeOrders);
  const drivers = useSelector((store) => store.DriversList.data);
  const Raiddriver = useSelector((store) => store.RaidDriver.data);
  let webSocked = useContext(webSockedContext);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const nodeRef = useRef(null);
  const dispatch = useDispatch();
  const [raidCount, setRaidCount] = useState();
  const [reason, setReason] = useState("");
  const [add_reason, setAdd_Reason] = useState("");
  const [cargoId, setCargoId] = useState("");
  const [many, setMany] = useState(false);
  const [comment, setComment] = useState("");
  const [user, setUser] = useState();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const ordersList = useSelector((store) => store.Orders.data);

  function errorAudio() {
    new Audio(error).play();
  }

  const logOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    window.location.reload();
    window.location.pathname = "/";
  };
  const showCancel = () => {
    setCargoId(modalContent.order.id);
    if (modalContent.order.number_cars > 1) {
      dispatch(showModals({ show: true, status: "cancel-order-reason" }));
    } else dispatch(showModals({ show: true, status: "cancel-order" }));
  };
  const delOrder = () => {
    if (reason) {
      let order = {
        command: "cancel_order",
        id: cargoId,
        reason,
        many,
      };
      webSocked.send(JSON.stringify(order));
      setReason("");
      setAdd_Reason("");
    } else {
      let idAlert = Date.now();
      let alert = {
        id: idAlert,
        text: t("reasonAlert"),
        img: "./images/red.svg",
        color: "#FFEDF1",
      };
      dispatch(addAlert(alert));
      errorAudio();
      setTimeout(() => {
        dispatch(delAlert(idAlert));
      }, 5000);
    }
  };

  useEffect(() => {
    dispatch(getOrders());

    axios
      .get(`https://api.buyukyol.uz/api/client/`, {
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setUser(response.data);
        setFirstName(response.data.first_name);
        setLastName(response.data.last_name);
      })
      .catch((error) => {
        if (error.response.statusText == "Unauthorized") {
          window.location.pathname = "/";
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
        }
      });
    return () => {
      getOrders();
    };
  }, []);

  const showModalContent = (order) => {
    dispatch(showModals({ show: true, status: "order", order }));
  };

  const sendRaid = (id, did) => {
    let raidList = {
      driver: id,
      delivery: did,
      mark: raidCount,
      comment: comment,
    };

    axios
      .post(`${baseUrl}api/comment/`, raidList, {
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        let idAlert = Date.now();
        let alert = {
          id: idAlert,
          text: t("raidDriverText"),
          img: "./images/green.svg",
          color: "#EDFFFA",
        };
        dispatch(addAlert(alert));
        setTimeout(() => {
          dispatch(delAlert(idAlert));
        }, 5000);
        dispatch(hideModal({ show: false }));

        let driver = Raiddriver.filter((item, index) => index > 0);
        dispatch(addRaidDriver(driver));
      })
      .catch((error) => {
        if (error.response.statusText == "Unauthorized") {
          window.location.pathname = "/";
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
        }
      });
  };

  const cancelRaid = (id) => {
    let cancelRaid = {
      command: "unrate",
      id: id,
    };

    webSocked.send(JSON.stringify(cancelRaid));

    let driver = Raiddriver.filter((item, index) => index > 0);
    dispatch(addRaidDriver(driver));
    dispatch(hideModal({ show: false }));
  };

  const reloadOrder = (id) => {
    let reloadList = {
      command: "activate_order",
      order_id: id,
    };
    webSocked.send(JSON.stringify(reloadList));
  };

  const editUser = () => {
    if (firstName.trim().length > 0 && lastName.trim().length) {
      let user = {
        first_name: firstName,
        last_name: lastName,
      };

      axios
        .patch(`${baseUrl}api/client/1/`, user, {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        })
        .then((response) => {
          window.location.reload();
          dispatch(hideModal({ show: false }));
        });
    } else {
      let idAlert = Date.now();
      let alert = {
        id: idAlert,
        text: t("alert3"),
        img: "./images/yellow.svg",
        color: "#FFFAEA",
      };
      dispatch(addAlert(alert));
      setTimeout(() => {
        dispatch(delAlert(idAlert));
      }, 5000);
    }
  };

  return (
    <CSSTransition
      in={modalContent.show || Raiddriver.length > 0}
      nodeRef={nodeRef}
      timeout={300}
      classNames="alert"
      unmountOnExit
    >
      <div
        className={`modal-sloy ${
          modalContent.status === "order" ? "align-none" : ""
        }`}
      >
        <div ref={nodeRef} className="modal-card">
          {modalContent.status === "log-out" && (
            <div className="confirm">
              <div className="toptext">{t("modal-title1")}</div>
              <div className="btns">
                <button
                  className="not-out"
                  onClick={() => dispatch(hideModal({ show: false }))}
                >
                  {t("button3")}
                </button>
                <button onClick={logOut}>{t("button4")}</button>
              </div>
            </div>
          )}

          {modalContent.status === "order" && modalContent.order && (
            <div className="show-order">
              <div className="cancel-btn">
                <img
                  onClick={() => dispatch(hideModal({ show: false }))}
                  src="./images/x.png"
                  alt=""
                />
              </div>
              <div className="title">{t("moreInfo")}</div>

              <div className="info-direction">
                <div className="label-info">{t("info1")}</div>
                <div className="value-info">
                  {modalContent.order.type === "OUT" ? t("direction2") : ""}
                  {modalContent.order.type === "IN" ? t("direction3") : ""}
                  {modalContent.order.type === "Abroad" ? t("direction1") : ""}
                </div>
              </div>

              <div className="info">
                <div className="label-info">{t("order-id")}</div>
                <div className="value-info"> {modalContent.order.id}</div>
              </div>

              <div className="info">
                <div className="label-info">{t("loc1")}</div>
                <div className="value-info">
                  {" "}
                  {modalContent.order.address_from}
                </div>
              </div>

              <div className="info">
                <div className="label-info">{t("loc3")}</div>
                <div className="value-info">
                  {" "}
                  {modalContent.order.address_to}
                </div>
              </div>

              <div className="info">
                <div className="label-info"> {t("info2")}</div>
                <div className="value-info"> {modalContent.order.cargo}</div>
              </div>

              <div className="info">
                <div className="label-info"> {t("info7")}</div>
                <div className="value-info">
                  {" "}
                  {modalContent.order.distance} {t("km")}
                </div>
              </div>

              <div className="info">
                <div className="label-info"> {t("info10")}</div>
                <div className="value-info">
                  {modalContent.order.payment_type == "1" ? t("payment1") : ""}
                  {modalContent.order.payment_type == "2" ? t("payment2") : ""}
                  {modalContent.order.payment_type == "3" ? t("payment3") : ""}
                </div>
              </div>

              <div className="info">
                <div className="label-info"> {t("info8")}</div>
                <div className="value-info">
                  {modalContent.order.negotiable ? (
                    t("negotiable")
                  ) : (
                    <>
                      {modalContent.order.price} {modalContent.order.currency}
                    </>
                  )}
                </div>
              </div>

              <div className="info">
                <div className="label-info"> {t("info3")}</div>
                <div className="value-info">
                  {" "}
                  {modalContent.order.number_cars} {t("infoWaits2")}
                </div>
              </div>

              <div className="info">
                <div className="label-info"> {t("info4")}</div>
                <div className="value-info">
                  {modalContent.order.capacity}
                  &nbsp;
                  {modalContent.order.unit == "1" ? t("infoWaits1") : ""}
                  {modalContent.order.unit == "2" ? t("infoWaits2") : ""}
                  {modalContent.order.unit == "3" ? t("infoWaits3") : ""}
                  {modalContent.order.unit == "4" ? t("infoWaits4") : ""}
                  {modalContent.order.unit == "5" ? t("infoWaits5") : ""}
                  {modalContent.order.unit == "6" ? t("infoWaits6") : ""}
                </div>
              </div>

              <div className="info">
                <div className="label-info">{t("info5")}</div>
                <div className="value-info">
                  {modalContent.order.car_category.name !==
                    "Avto tashuvchi" && (
                    <>
                      {modalContent.order.car_category.min_weight
                        ? modalContent.order.car_category.min_weight
                        : ""}
                      -
                      {modalContent.order.car_category.max_weight
                        ? modalContent.order.car_category.max_weight
                        : ""}{" "}
                      {t("infoWaits4")}, &nbsp;
                    </>
                  )}

                  {i18next.language === "uz"
                    ? modalContent.order.car_category.name
                    : ""}
                  {i18next.language === "ru"
                    ? modalContent.order.car_category.name_ru
                    : ""}
                  {i18next.language === "en"
                    ? modalContent.order.car_category.name_en
                    : ""}
                </div>
              </div>

              <div className="info">
                <div className="label-info"> {t("info6")}</div>
                <div className="value-info">
                  {" "}
                  {i18next.language === "uz" &&
                    modalContent.order.car_body_type.name}
                  {i18next.language === "ru" &&
                    modalContent.order.car_body_type.name_ru}
                  {i18next.language === "en" &&
                    modalContent.order.car_body_type.name_en}
                </div>
              </div>

              {modalContent.order.temprature ? (
                <div className="info">
                  <div className="label-info"> {t("temprature-name")}</div>
                  <div className="value-info">
                    {" "}
                    {modalContent.order.temprature === "1" && t("temrature1")}
                    {modalContent.order.temprature === "2" && t("temrature2")}
                    {modalContent.order.temprature === "3" && t("temrature3")}
                    {modalContent.order.temprature === "4" && t("temrature4")}
                    {modalContent.order.temprature === "5" && t("temrature5")}
                    {modalContent.order.temprature === "6" && t("temrature6")}
                  </div>
                </div>
              ) : (
                ""
              )}

              {modalContent.order.avans ? (
                <div className="info">
                  <div className="label-info"> {t("info9")}</div>
                  <div className="value-info">
                    {" "}
                    {modalContent.order.avans} {modalContent.order.currency}
                  </div>
                </div>
              ) : (
                ""
              )}

              {modalContent.order.wait_cost ? (
                <div className="info">
                  <div className="label-info"> {t("info11")}</div>

                  <div className="value-info">
                    {modalContent.order.wait_cost} {modalContent.order.currency}
                  </div>
                </div>
              ) : (
                ""
              )}

              {modalContent.order.load_time ? (
                <div className="info">
                  <div className="label-info"> {t("info12")}</div>
                  <div className="value-info">
                    {modalContent.order.load_time.slice(0, 10)},
                    {modalContent.order.load_time.slice(11, 16)}
                  </div>
                </div>
              ) : (
                ""
              )}

              {modalContent.order.start_time ? (
                <div className="info">
                  <div className="label-info"> {t("info13")}</div>
                  <div className="value-info">
                    {modalContent.order.start_time.slice(0, 10)},
                    {modalContent.order.start_time.slice(11, 16)}
                  </div>
                </div>
              ) : (
                ""
              )}

              {modalContent.order.status === "Delivered" ? (
                <div className="info-direction">
                  <div className="label-info"> {t("timeCargo2")}</div>
                  <div className="value-info">
                    {modalContent.order.ordered_time.slice(0, 10)},
                    {modalContent.order.ordered_time.slice(11, 16)}
                  </div>
                </div>
              ) : (
                ""
              )}

              {modalContent.order.rejected_reason ? (
                <div className="info">
                  <div className="reason-title">{t("reasonOrder")}:</div>
                  <div className="value-info-reason">
                    {modalContent.order.rejected_reason === "Fikrim o'zgardi"
                      ? t("reason1")
                      : modalContent.order.rejected_reason ===
                        "Xato ma'lumot kiritibman"
                      ? t("reason2")
                      : modalContent.order.rejected_reason ===
                        "Haydovchi bekor qilishni so'radi"
                      ? t("reason3")
                      : modalContent.order.rejected_reason}
                  </div>
                </div>
              ) : (
                ""
              )}

              {modalContent.order.status === "Delivered" ||
              modalContent.order.status === "Rejected" ? (
                ""
              ) : (
                <div onClick={showCancel} className="cancel-order">
                  {t("button3")}
                </div>
              )}

              {modalContent.order.status === "Rejected" ? (
                <div
                  onClick={() => reloadOrder(modalContent.order.id)}
                  className="reload-order"
                >
                  {t("button8")}
                </div>
              ) : (
                ""
              )}
            </div>
          )}

          {modalContent.status === "cancel-order" && (
            <div className="cancel-order">
              <div className="cancel-btn">
                <img
                  onClick={() => dispatch(hideModal({ show: false }))}
                  src="./images/x.png"
                  alt=""
                />
              </div>

              <div className="title">{t("reasonText")}</div>

              <div className="cancel-order-info">
                <div>
                  <input
                    onChange={(e) => {
                      setReason(e.target.value);
                    }}
                    id="reason1"
                    type="radio"
                    name="money"
                    value="Fikrim o'zgardi"
                  />
                  <label htmlFor="reason1">{t("reason1")}</label>
                </div>

                <div>
                  <input
                    onChange={(e) => {
                      setReason(e.target.value);
                    }}
                    id="reason2"
                    type="radio"
                    name="money"
                    value="Xato ma'lumot kiritibman"
                  />
                  <label htmlFor="reason2">{t("reason2")}</label>
                </div>

                <div>
                  <input
                    onChange={(e) => {
                      setReason(e.target.value);
                    }}
                    id="reason3"
                    type="radio"
                    name="money"
                    value="Haydovchi bekor qilishni so'radi"
                  />
                  <label htmlFor="reason3">{t("reason3")}</label>
                </div>

                <div>
                  <input
                    onChange={(e) => {
                      setReason(e.target.value);
                    }}
                    id="reason5"
                    type="radio"
                    name="money"
                    value={add_reason}
                  />
                  <label htmlFor="reason3">
                    <input
                      placeholder={t("reason4")}
                      onChange={(e) => setAdd_Reason(e.target.value)}
                      id="reason4"
                      type="text"
                      name="money"
                    />
                  </label>
                </div>

                <div onClick={delOrder} className="cancel-btn">
                  {t("button2")}
                </div>
              </div>
            </div>
          )}

          {modalContent.status === "cancel-order-reason" && (
            <div className="cancel-order">
              <div className="cancel-btn">
                <img
                  onClick={() => dispatch(hideModal({ show: false }))}
                  src="./images/x.png"
                  alt=""
                />
              </div>

              <div className="title-reason">{t("reasonText1")}</div>

              <div className="cancel-order-info">
                <div>
                  <input
                    onChange={() => setMany(true)}
                    id="reasonYes"
                    type="radio"
                    name="reasons"
                  />
                  <label htmlFor="reasonYes">{t("yes")}</label>
                </div>

                <div>
                  <input
                    checked={true}
                    onChange={() => setMany(false)}
                    id="reasonNo"
                    type="radio"
                    name="reasons"
                  />
                  <label htmlFor="reasonNo">{t("no")}</label>
                </div>

                <div
                  onClick={() =>
                    dispatch(showModals({ show: true, status: "cancel-order" }))
                  }
                  className="cancel-btn"
                >
                  {t("button2")}
                </div>
              </div>
            </div>
          )}

          {modalContent.status === "drivers" && (
            <div className="drivers-list">
              <div className="cancel-btn">
                <img
                  onClick={() => dispatch(hideModal({ show: false }))}
                  src="./images/x.png"
                  alt=""
                />
              </div>

              <div className="title">{t("driver")}</div>

              <div className="drivers-info">
                {ordersList.map((item, index) => {
                  if (item.status === "Delivering") {
                    return (
                      <div key={index} className="order">
                        <div className="top-side-order">
                          <div className="date">
                            {item.ordered_time.slice(0, 10)}, &nbsp;
                            {item.ordered_time.slice(11, 16)}
                          </div>
                        </div>

                        <div className="cards">
                          <div
                            onClick={() => showModalContent(item)}
                            className="bottom-side-order"
                          >
                            <div className="photo">
                              <img
                                src={`${baseUrl}${item.car_category.image}`}
                                alt=""
                              />
                            </div>

                            <div className="content">
                              <div className="title">
                                {item.order_title
                                  ? item.order_title
                                  : item.type === "OUT"
                                  ? t("direction2")
                                  : item.type === "IN"
                                  ? t("direction3")
                                  : t("direction1")}
                              </div>
                              <div className="text">
                                <img src="./images/location.png" alt="" />
                                <div className="info">
                                  <div className="label">{t("info7")}</div>
                                  <div className="content">
                                    {item.distance} km
                                  </div>
                                </div>
                              </div>
                              <div className="text">
                                <img src="./images/price.png" alt="" />
                                <div className="info">
                                  <div className="label">{t("info14")}</div>
                                  <div className="content">
                                    {item.price} {item.currency}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="line"></div>

                          <a
                            href={`tel:${+item.driver.phone}`}
                            className="bottom-side-driver"
                          >
                            <div className="photo">
                              <img src={baseUrl + item.driver.image} alt="" />
                            </div>

                            <div className="content">
                              <div className="title">{item.driver.name}</div>
                              <div className="text">
                                <img src="./images/truck2.png" alt="" />
                                <div className="info">
                                  <div className="label">
                                    {item.driver.car_name}
                                  </div>
                                  <div className="content">
                                    {item.driver.car_number}
                                  </div>
                                </div>
                              </div>
                              <div className="text">
                                <img src="./images/phone.png" alt="" />
                                <div className="info">
                                  <div className="label">
                                    {item.driver.phone}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </a>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          )}

          {modalContent.status === "active-orders" && (
            <div className="active-orders-list">
              <div className="cancel-btn">
                <img
                  onClick={() => dispatch(hideModal({ show: false }))}
                  src="./images/x.png"
                  alt=""
                />
              </div>

              <div className="title">{t("cargoLabel1")}</div>

              <div className="orders-info">
                {activeOrders.map((item, index) => {
                  return (
                    <div
                      key={index}
                      onClick={() => {
                        showModalContent(item);
                      }}
                    >
                      <div className="top-side-order">
                        <div className="date">
                          {item.ordered_time.slice(0, 10)}, &nbsp;
                          {item.ordered_time.slice(11, 16)}
                        </div>
                      </div>

                      <div className="bottom-side-order">
                        <div className="photo">
                          <img
                            src={`${baseUrl}${item.car_category.image}`}
                            alt=""
                          />
                        </div>

                        <div className="content">
                          <div className="title">
                            {item.order_title
                              ? item.order_title
                              : item.type === "OUT"
                              ? t("direction2")
                              : item.type === "IN"
                              ? t("direction3")
                              : t("direction1")}
                          </div>
                          <div className="text">
                            <img src="./images/location.png" alt="" />
                            <div className="info">
                              <div className="label">{t("info7")}</div>
                              <div className="content">{item.distance} km</div>
                            </div>
                          </div>
                          <div className="text">
                            <img src="./images/price.png" alt="" />
                            <div className="info">
                              <div className="label">{t("info14")}</div>
                              <div className="content">
                                {item.price} {item.currency}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {modalContent.status === "contacts" && (
            <div className="contact-list">
              <div className="cancel-btn">
                <img
                  onClick={() => dispatch(hideModal({ show: false }))}
                  src="./images/x.png"
                  alt=""
                />
              </div>

              <div className="title">{t("contact")}</div>

              <div className="contact-info">
                <a href="tel: +998955777971" className="contacts">
                  <div className="icon">
                    <img src="./images/mdi_telephone.png" alt="" />
                  </div>
                  <div className="text">+998 (95) 577-79-71</div>
                </a>

                <a href="tel: +998955777972" className="contacts">
                  <div className="icon">
                    <img src="./images/mdi_telephone.png" alt="" />
                  </div>
                  <div className="text">+998 (95) 577-79-72</div>
                </a>

                <a href="https://t.me/buyukyol_admin" className="contacts">
                  <div className="icon">
                    <img src="./images/sms.png" alt="" />
                  </div>
                  <div className="text">{t("send-sms")}</div>
                </a>

                <div className="social-media">
                  <a href="https://t.me/buyukyol_uz" target="blank_"> 
                  <img src="./images/telegram.png" alt="" /></a>

                  <a href="https://www.instagram.com/buyukyol_uz/" target="blank_">
                    <img src="./images/instagram.png" alt="" /></a>

                  <a href="https://www.tiktok.com/@buyukyol_uz?_t=8l8MCjzfWdk&_r=1" target="blank_"> 
                  <img src="./images/tiktok.png" alt="" /></a>

                  <a href="https://www.youtube.com/@buyukyol_uz" target="blank_"> <img src="./images/youtube.png" alt="" /></a>
                  
                  <a href="https://www.facebook.com/people/Buyukyol-Logistic/pfbid09mbWmsWGkLjuLEW51AWjJz8Ue125zN5KPqRP3dtH5mTzP5V97EqB4xGTRYvYELjUl/" target="blank_">
                    <img src="./images/facebook.png" alt="" /></a>
                </div>
              </div>
            </div>
          )}

          {Raiddriver.length > 0 ? (
            <div className="driver-raid">
              <div className="photo-driver">
                <img src={`${baseUrl}${Raiddriver[0].driver.image}`} alt="" />
              </div>

              <div className="title">{t("raidDriver")}</div>

              <div className="description">{t("raidDriver2")}</div>

              <div className="stars">
                <ReactStars
                  count={5}
                  onChange={(e) => {
                    setRaidCount(e);
                  }}
                  size={50}
                  color2={"#047766"}
                  half={false}
                />
              </div>

              <div className="comment-box">
                <input
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t("comment")}
                  type="text"
                />
              </div>

              <div className="buttons">
                <button
                  onClick={() => cancelRaid(Raiddriver[0].id)}
                  className="cancel-btn"
                >
                  {t("button3")}
                </button>

                <button
                  onClick={() =>
                    sendRaid(Raiddriver[0].driver.id, Raiddriver[0].id)
                  }
                  className="next-btn "
                >
                  {t("button2")}
                </button>
              </div>
            </div>
          ) : (
            ""
          )}

          {modalContent.status === "active-driver" && (
            <div className="active-driver-list">
              <div className="cancel-btn">
                <img
                  onClick={() => dispatch(hideModal({ show: false }))}
                  src="./images/x.png"
                  alt=""
                />
              </div>

              <div className="title">{t("order")}</div>

              {drivers.map((item, index) => {
                if (item.driver.id === modalContent.item.driver) {
                  return (
                    <div key={index} className="drivers-info">
                      <div
                        onClick={() => {
                          navigate("/history");
                          dispatch(hideModal({ show: false }));
                        }}
                        className="bottom-side-driver"
                      >
                        <div className="photo">
                          <img src={baseUrl + item.driver.image} alt="" />
                        </div>

                        <div className="content">
                          <div className="title">
                            {item.driver.first_name} {item.driver.last_name}
                          </div>
                          <div className="text">
                            <img src="./images/truck2.png" alt="" />
                            <div className="info">
                              <div className="label">{item.driver.name}</div>
                              <div className="content">
                                {item.driver.car_number}
                              </div>
                            </div>
                          </div>
                          <div className="text">
                            <img src="./images/phone.png" alt="" />
                            <div className="info">
                              <div className="label">{item.driver.phone}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="information-cargo">
                        <div className="label-info">{t("loc1")}</div>
                        <div className="info">{item.order.address_from}</div>
                      </div>

                      <div className="information-cargo">
                        <div className="label-info">{t("loc3")}</div>
                        <div className="info">{item.order.address_from}</div>
                      </div>

                      <div className="information-cargo">
                        <div className="label-info">{t("info2")}</div>
                        <div className="info">{item.order.cargo}</div>
                      </div>

                      <div className="information-cargo">
                        <div className="label-info">{t("info4")}</div>
                        <div className="info">
                          {item.order.capacity} {item.order.unit}
                        </div>
                      </div>

                      <div className="information-cargo">
                        <div className="label-info">{t("info8")}</div>
                        <div className="info">
                          {item.order.price} {item.order.currency}
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          )}

          {modalContent.status === "edit-user" && (
            <div className="edit-user">
              <div className="cancel-btn">
                <img
                  onClick={() => dispatch(hideModal({ show: false }))}
                  src="./images/x.png"
                  alt=""
                />
              </div>

              <div className="title">{t("edit-user")}</div>

              <div className="input-user-info">
                <input
                  onChange={(e) => setFirstName(e.target.value)}
                  value={firstName}
                  placeholder={t("registertext2")}
                  type="text"
                />
                <input
                  onChange={(e) => setLastName(e.target.value)}
                  value={lastName}
                  placeholder={t("registertext3")}
                  type="text"
                />
              </div>

              <div onClick={editUser} className="edit-btn">
                {t("button2")}
              </div>
            </div>
          )}
        </div>
      </div>
    </CSSTransition>
  );
};
export default Modal;
