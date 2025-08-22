import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./productAction";

export interface ProductItem {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryName: string;
  salesCount: number;
  imageUrl?: string;
}

interface ProductState {
  products: ProductItem[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    clearProducts(state) {
      state.products = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(
        fetchProducts.fulfilled,
        (s, a: PayloadAction<ProductItem[]>) => {
          s.loading = false;
          s.products = a.payload;
        }
      )
      .addCase(fetchProducts.rejected, (s, a) => {
        s.loading = false;
        s.error = (a.payload as string) || a.error.message || "Failed to load products";
      });

    builder
      .addCase(createProduct.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(createProduct.fulfilled, (s, a: PayloadAction<ProductItem>) => {
        s.loading = false;
        s.products.push(a.payload);
      })
      .addCase(createProduct.rejected, (s, a) => {
        s.loading = false;
        s.error = (a.payload as string) || a.error.message || "Create failed";
      });

    builder
      .addCase(updateProduct.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(updateProduct.fulfilled, (s, a: PayloadAction<ProductItem>) => {
        s.loading = false;
        const idx = s.products.findIndex((p) => p.id === a.payload.id);
        if (idx !== -1) {
          s.products[idx] = a.payload;
        }
      })
      .addCase(updateProduct.rejected, (s, a) => {
        s.loading = false;
        s.error = (a.payload as string) || a.error.message || "Update failed";
      });

    builder
      .addCase(deleteProduct.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(deleteProduct.fulfilled, (s, a: PayloadAction<number>) => {
        s.loading = false;
        s.products = s.products.filter((p) => p.id !== a.payload);
      })
      .addCase(deleteProduct.rejected, (s, a) => {
        s.loading = false;
        s.error = (a.payload as string) || a.error.message || "Delete failed";
      });
  },
});

export default productSlice.reducer;
export const { clearProducts } = productSlice.actions;
