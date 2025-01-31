import "./not-found.scss";
import {useTranslation} from "react-i18next";

const NotFound = () => {
    const {t} = useTranslation();

    return <div className="not-found-wrapper">
        <div className="sloy">
            <div className="text1">
                <div className="error">
                    error 404
                </div>
                <div className="text">
                    {t("page-not-found")}
                </div>
            </div>
        </div>
    </div>
};

export default NotFound