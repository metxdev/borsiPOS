import { createSlice } from "@reduxjs/toolkit";
import { placeOrder, placeOrderWithRefresh } from "./orderAction";

interface OrderState {
  placing: boolean;
  error: string | null;
  success: boolean;
}

const initialState: OrderState = {
  placing: false,
  error: null,
  success: false,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    resetOrderState(state) {
      state.placing = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrderWithRefresh.pending, (s) => {
        s.placing = true;
        s.error = null;
        s.success = false;
      })
      .addCase(placeOrderWithRefresh.fulfilled, (s) => {
        s.placing = false;
        s.success = true;
      })
      .addCase(placeOrderWithRefresh.rejected, (s, a) => {
        s.placing = false;
        s.error = (a.payload as string) || "Failed to place order";
      });
  },
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
