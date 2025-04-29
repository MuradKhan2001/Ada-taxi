import {configureStore} from "@reduxjs/toolkit"
import baseUrl from "./BaseUrl";
import Alerts from  "./AlertsBox";
import ModalContent  from  "./ModalContent"
import PickUpLocations  from "./PickUpLocations"
import DropOffLocations  from "./DropOffLocations"
import PaymentType  from "./PaymentType"
import AddClient  from "./AddClient"
import GetLocations  from "./GetLocations"

export const store = configureStore({
    reducer: {
        baseUrl,
        Alerts,
        ModalContent,
        PickUpLocations,
        DropOffLocations,
        PaymentType,
        AddClient,
        GetLocations
    }
})