import {createSlice} from "@reduxjs/toolkit"

export const baseUrl = createSlice({
    name: "baseUrl",
    initialState: {data: "https://api.buyukyol.uz/"},
    // initialState: {data: "http://192.168.43.59:5000/"},
})

export default baseUrl.reducer

