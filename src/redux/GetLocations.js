import {createSlice} from "@reduxjs/toolkit"

export const GetLocations = createSlice({
    name: "GetLocations",
    initialState: {
        data: {
            show: false
        }
    },
    reducers: {
        ShowHideModal: (state, {payload}) => {
            state.data = payload
        }
    }
})

export const {ShowHideModal} = GetLocations.actions
export default GetLocations.reducer