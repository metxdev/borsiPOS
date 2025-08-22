import { createProduct } from "@/store/product/productAction";
import { fetchCategories } from "@/store/category/categoryAction";
import { AppDispatch, RootState } from "@/store/store";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { ChevronRight } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function AddProductModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { categories } = useSelector((s: RootState) => s.category);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceRaw, setPriceRaw] = useState("0");
  const [price, setPrice] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<string>("");

  useEffect(() => {
    if (!categories.length) dispatch(fetchCategories());
  }, [categories, dispatch]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value;
    if (!/^\d*\.?\d*$/.test(v)) return;
    if (v.length > 1 && v.startsWith("0") && v[1] !== ".") {
      v = v.replace(/^0+/, "") || "0";
    }
    setPriceRaw(v);
    const parsed = Number(v);
    if (!isNaN(parsed)) setPrice(parsed);
  };

  const handlePriceBlur = () => {
    let normalized = priceRaw;
    if (normalized === "" || normalized === ".") normalized = "0";
    if (normalized.endsWith(".")) normalized = normalized.slice(0, -1);
    if (normalized.length > 1 && normalized.startsWith("0") && normalized[1] !== ".") {
      normalized = normalized.replace(/^0+/, "") || "0";
    }
    setPriceRaw(normalized);
    const parsed = Number(normalized);
    if (!isNaN(parsed)) setPrice(parsed);
  };

  const save = async () => {
    if (!name.trim() || !categoryId) return;
    await dispatch(
      createProduct({
        name: name.trim(),
        description: description.trim(),
        price,
        categoryId: Number(categoryId),
      })
    );
    setName("");
    setDescription("");
    setPrice(0);
    setPriceRaw("0");
    setCategoryId("");
    onClose();
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        onClose={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <TransitionChild
          as={Fragment}
          enter="transition-opacity ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <DialogBackdrop className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </TransitionChild>

        <TransitionChild
          as={Fragment}
          enter="transition-all ease-out duration-200"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transition-all ease-in duration-150"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <DialogPanel className="relative z-10 w-full max-w-md rounded-2xl bg-card p-6 border border-neutral-800 shadow-xl">
            <header className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-light">Add New Product</h2>
              <button onClick={onClose} className="text-muted hover:text-white">
                <ChevronRight size={24} />
              </button>
            </header>

            <div className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm text-muted mb-1">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Espresso Martini"
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-light focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm text-muted mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-light focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">Select</option>
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-muted mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Short description or ingredients"
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-light focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm text-muted mb-1">Price (€)</label>
                <input
                  type="text"
                  value={priceRaw}
                  onChange={handlePriceChange}
                  onBlur={handlePriceBlur}
                  inputMode="decimal"
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-light focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={!name.trim() || !categoryId}
                  className="px-4 py-2 bg-accent text-white text-sm rounded-lg disabled:opacity-40"
                >
                  Save
                </button>
              </div>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
