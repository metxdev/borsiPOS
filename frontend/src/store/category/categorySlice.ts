import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchCategories, createCategory } from "./categoryAction";

interface Category { id: number; name: string; }

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchCategories.fulfilled, (s, a: PayloadAction<Category[]>) => {
        s.loading = false;
        s.categories = a.payload;
      })
      .addCase(fetchCategories.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message || "Failed to load";
      })

      .addCase(createCategory.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(createCategory.fulfilled, (s) => {
        s.loading = false;
      })
      .addCase(createCategory.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message || "Failed to create";
      });
  },
});

export default categorySlice.reducer;
