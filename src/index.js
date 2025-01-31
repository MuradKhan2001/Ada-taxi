import React from 'react';
import ReactDOM from 'react-dom/client';
import "./global.scss"
import {BrowserRouter as Router} from "react-router-dom";
import Loader from "./components/loader/Loader";
import i18next from "i18next";
import {initReactI18next} from "react-i18next";
import uz from "./languages/uz/uz.json";
import ru from "./languages/ru/ru.json";
import en from "./languages/en/en.json";
import {Provider} from "react-redux";
import {store} from "./redux/store";

const App = React.lazy(() => import('./components/app/App'));

i18next.use(initReactI18next).init({
    resources: {
        uz: {
            translation: uz,
        }, ru: {
            translation: ru,
        }, en: {
            translation: en,
        }
    }, lng: localStorage.getItem("lng") || "uz",
});
export default i18next

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode>

    <Provider store={store}>
        <React.Suspense fallback={<Loader/>}>
            <Router>
                <App/>
            </Router>
        </React.Suspense>
    </Provider>

</React.StrictMode>);