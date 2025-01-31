import {createSlice} from "@reduxjs/toolkit"

export const ModalContent = createSlice({
    name: "ModalContent",
    initialState: {
        data: {
            show: false
        }
    },
    reducers: {
        showModals: (state, {payload}) => {
            state.data = payload
        },
        hideModal: (state, {payload}) => {
            state.data = payload
        }
    }
})

export const {showModals, hideModal} = ModalContent.actions
export default ModalContent.reducer