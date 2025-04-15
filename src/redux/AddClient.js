import {createSlice} from "@reduxjs/toolkit"

export const AddClient = createSlice({
    name: "AddClient",
    initialState: {
        data: {
            name: "",
            phone: "",
        }
    },
    reducers: {
        AddClientInfo: (state, {payload}) => {
            state.data = payload
        }
    }
})

export const {AddClientInfo} = AddClient.actions
export default AddClient.reducer