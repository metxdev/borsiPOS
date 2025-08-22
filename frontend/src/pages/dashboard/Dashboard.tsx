import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import CategoryCard from "@/components/CategoryCard";
import ProductGrid, { Product as GridProduct } from "@/components/ProductGrid";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchCategories,
  deleteCategory,
} from "@/store/category/categoryAction";
import { fetchProducts, deleteProduct } from "@/store/product/productAction";
import { clearProducts } from "@/store/product/productSlice";
import AddCategoryModal from "@/components/AddCategoryModal";
import AddProductModal from "@/components/AddProductModal";
import EditProductModal, { ProductItem } from "@/components/EditProductModal";
import EditCategoryModal from "@/components/EditCategoryModal"; // ✅ IMPORT ADDED

export default function MenuPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { categories } = useSelector((s: RootState) => s.category);
  const { products, loading } = useSelector((s: RootState) => s.product);
  const user = useSelector((s: RootState) => s.auth.user);

  const [activeCategory, setActiveCategory] = useState("all");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  const [editingCategory, setEditingCategory] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (!user) return;
    dispatch(clearProducts());
    dispatch(fetchProducts());
  }, [user?.id, dispatch]);

  const filtered: GridProduct[] =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.categoryName === activeCategory);

  const countBy = useMemo(
    () => (cat: string) => products.filter((p) => p.categoryName === cat).length,
    [products]
  );

  const handleDeleteProduct = (prod: GridProduct) => {
    if (confirm(`Delete "${prod.name}"?`)) {
      dispatch(deleteProduct(prod.id));
    }
  };

  const handleEditCategory = (id: number, currentName: string) => {
    setEditingCategory({ id, name: currentName });
    setIsEditCategoryOpen(true);
  };

  const handleDeleteCategory = (id: number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      dispatch(deleteCategory(id));
      if (activeCategory !== "all") setActiveCategory("all");
    }
  };

  return (
    <div className="relative space-y-6">
      <PageHeader
        title="Menu"
        subtitle="Manage categories and products."
        actions={
          <>
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="bg-accent text-white px-4 py-2 rounded-lg"
            >
              Add Product
            </button>
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="bg-card border border-accent text-accent px-4 py-2 rounded-lg"
            >
              Add Category
            </button>
          </>
        }
      />

      {/* Categories Section */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Categories</h2>
        <div className="flex gap-2">
          <CategoryCard
            name="All"
            count={products.length}
            active={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
          />
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              name={cat.name}
              count={countBy(cat.name)}
              active={activeCategory === cat.name}
              onClick={() => setActiveCategory(cat.name)}
              onEdit={() => handleEditCategory(cat.id, cat.name)}
              onDelete={() => handleDeleteCategory(cat.id)}
            />
          ))}
        </div>
      </Card>

      {/* Products Section */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">All menu items</h2>

        {loading && <p className="text-muted">Loading products…</p>}

        {!loading && filtered.length > 0 && (
          <ProductGrid
            key={user?.id ?? "anon"}
            products={filtered}
            onEdit={(prod) => {
              setSelectedProduct(prod as ProductItem);
              setIsEditProductOpen(true);
            }}
            onDelete={handleDeleteProduct}
          />
        )}

        {!loading && filtered.length === 0 && (
          <p className="text-muted">
            {activeCategory === "all"
              ? "No products available."
              : `No products in “${activeCategory}”.`}
          </p>
        )}
      </Card>

      {/* Modals */}
      <AddCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
      />
      {selectedProduct && (
        <EditProductModal
          isOpen={isEditProductOpen}
          onClose={() => {
            setIsEditProductOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
        />
      )}
      {editingCategory && (
        <EditCategoryModal
          isOpen={isEditCategoryOpen}
          onClose={() => {
            setIsEditCategoryOpen(false);
            setEditingCategory(null);
          }}
          categoryId={editingCategory.id}
          initialName={editingCategory.name}
        />
      )}
    </div>
  );
}
