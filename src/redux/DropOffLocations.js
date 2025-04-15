import {createSlice} from "@reduxjs/toolkit"

export const DropOffLocations = createSlice({
    name: "DropOffLocations",
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
        addLocationsDrop: (state, {payload}) => {
            state.data = [...state.data, payload]
        },
        delLocationsDrop: (state, {payload}) => {
            state.data = state.data.filter((item) => item.number !== payload)
        },
        updateDropLocationDrop: (state, { payload }) => {
            const { index, newData } = payload;
            if (state.data[index]) {
                state.data[index] = {
                    ...state.data[index],
                    ...newData
                };
            }
        }
    }
})

export const {delLocationsDrop, addLocationsDrop, updateDropLocationDrop} = DropOffLocations.actions
export default DropOffLocations.reducer