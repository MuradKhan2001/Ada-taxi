import {createSlice} from "@reduxjs/toolkit"

export const PaymentType = createSlice({
    name: "PaymentType",
    initialState: {
        data: {
            payment_type: "cash"
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