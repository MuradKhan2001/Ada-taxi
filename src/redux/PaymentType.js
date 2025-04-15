import {createSlice} from "@reduxjs/toolkit"

export const PaymentType = createSlice({
    name: "PaymentType",
    initialState: {
        data: {
            payment_type: "Naqt"
        }
    },
    reducers: {
        changePayment: (state, {payload}) => {
            state.data = payload
        }
    }
})

export const {changePayment} = PaymentType.actions
export default PaymentType.reducer