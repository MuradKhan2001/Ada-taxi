import {createSlice} from "@reduxjs/toolkit"

export const DriverLocation = createSlice({
    name: "DriverLocation",
    initialState: {
        data: {}
    },
    reducers: {
        changeLocation: (state, {payload}) => {
            state.data = payload
        }
    }
})

export const {changeLocation} = DriverLocation.actions
export default DriverLocation.reducer