import {createSlice} from "@reduxjs/toolkit"

export const baseUrl = createSlice({
    name: "baseUrl",
    initialState: {data: "http://157.245.37.245"},
})

export default baseUrl.reducer

