import {createSlice} from "@reduxjs/toolkit"

export const PickUpLocations = createSlice({
    name: "PickUpLocations",
    initialState: {
        data: [
            {
                address: "",
                latitude: null,
                longitude: null,
                number: 1
            }
        ]
    },
    reducers: {
        addLocations: (state, {payload}) => {
            state.data = [...state.data, payload]
        },
        delLocations: (state, {payload}) => {
            state.data = state.data.filter((item) => item.number !== payload)
        },
        updateDropLocationPickUp: (state, {payload}) => {
            const {index, newData} = payload;
            if (state.data[index]) {
                state.data[index] = {
                    ...state.data[index],
                    ...newData
                };
            }
        },
        clearPickUpLocations: (state) => {
            state.data = [
                {
                    address: "",
                    latitude: null,
                    longitude: null,
                    number: 1
                }
            ];
        }
    }
})

export const {delLocations, clearPickUpLocations, addLocations, updateDropLocationPickUp} = PickUpLocations.actions
export default PickUpLocations.reducer