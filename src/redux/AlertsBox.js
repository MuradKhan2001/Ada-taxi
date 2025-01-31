import {createSlice} from "@reduxjs/toolkit"

export const Alerts = createSlice({
    name: "Alerts",
    initialState: {
        data: []
    },
    reducers: {
        addAlert: (state, {payload}) => {
            state.data = [...state.data, payload].reverse()
        },
        delAlert: (state, {payload}) => {
            state.data = state.data.filter((item) => item.id !== payload)
        }
    }
})

export const {addAlert, delAlert} = Alerts.actions
export default Alerts.reducer