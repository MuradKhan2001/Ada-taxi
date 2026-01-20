import {createSlice} from "@reduxjs/toolkit"

export const ShowHideMenu = createSlice({
    name: "ShowHideMenu",
    initialState: {
        data: {
            show: false,
        }
    },
    reducers: {
        show: (state, {payload}) => {
            state.data = payload
        },
        hide: (state, {payload}) => {
            state.data = payload
        }
    }
})

export const {show, hide} = ShowHideMenu.actions
export default ShowHideMenu.reducer