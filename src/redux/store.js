import {configureStore} from "@reduxjs/toolkit"
import baseUrl from "./BaseUrl";
import Alerts from "./AlertsBox";
import ModalContent from "./ModalContent"
import ShowHideMenu from "./ShowMenu"
import PickUpLocations from "./PickUpLocations"
import DropOffLocations from "./DropOffLocations"
import PaymentType from "./PaymentType"
import AddClient from "./AddClient"
import GetLocations from "./GetLocations"
import DriverLocation from "./DriverLocation"
import ActiveOrders from "./ActiveOrders"
import OrderPage from "./OrderPage"


export const store = configureStore({
    reducer: {
        baseUrl,
        ShowHideMenu,
        Alerts,
        ModalContent,
        PickUpLocations,
        DropOffLocations,
        PaymentType,
        AddClient,
        GetLocations,
        DriverLocation,
        ActiveOrders,
        OrderPage
    }
})