import "./style.scss";
import {useSelector, useDispatch} from "react-redux";
import {delAlert} from "../../redux/AlertsBox"

const Alerts = () => {
    const dispatch = useDispatch()
    const Alerts = useSelector((store) => store.Alerts.data)
    const delAlerts = (id) => {
        dispatch(delAlert(id))
    }

    return <div className="alerts-container">

        {
            Alerts.length > 0 && <div className={`alerts-box ${Alerts.length > 3 ? "alerts-box-hide" : ""}`}>
                {Alerts.map((item, index) => {
                    return <div style={{
                        borderTop: `4px solid ${item.color === "#EDFFFA" ? "#5b9f68": "#dd495f"}`,
                        background:item.color
                    }} key={index} className="alert">
                        <div className="left-side">
                            <img src={item.img} alt=""/>
                        </div>
                        <div className="right-side">
                            {item.text}
                        </div>
                        <div className="xbtn">
                            <img onClick={() => delAlerts(item.id)} src="./images/x-button.png" alt=""/>
                        </div>
                    </div>
                })}
            </div>
        }

    </div>
}

export default Alerts