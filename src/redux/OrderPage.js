import {createSlice} from "@reduxjs/toolkit"

export const OrderPage = createSlice({
    name: "OrderPage",
    initialState: {
        data: 0
    },
    reducers: {
        setPageNumber: (state, {payload}) => {
            state.data = payload
        }
    }
})

export const {setPageNumber} = OrderPage.actions
export default OrderPage.reducer