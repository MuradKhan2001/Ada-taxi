import {createSlice} from "@reduxjs/toolkit"

export const ActiveOrders = createSlice({
    name: "ActiveOrders",
    initialState: {
        data: []
    },
    reducers: {
        getOrder: (state, {payload}) => {
            state.data = payload
        }
    }
})

export const {getOrder} = ActiveOrders.actions
export default ActiveOrders.reducer