import {createSlice} from "@reduxjs/toolkit"

export const baseUrl = createSlice({
    name: "baseUrl",
    initialState: {data: "https://api.adataxi.uz"},
})

export default baseUrl.reducer

