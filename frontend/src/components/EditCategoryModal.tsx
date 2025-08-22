import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { updateCategory, fetchCategories } from "@/store/category/categoryAction";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categoryId: number;
  initialName: string;
}

export default function EditCategoryModal({ isOpen, onClose, categoryId, initialName }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [name, setName] = useState(initialName);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  const save = async () => {
    if (!name.trim()) return;
    await dispatch(updateCategory({ id: categoryId, name: name.trim() }));
    await dispatch(fetchCategories());
    onClose();
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose}>
        <TransitionChild as={Fragment}>
          <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        </TransitionChild>

        <TransitionChild as={Fragment}>
          <DialogPanel className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-neutral-900 border border-neutral-700 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-light">Edit Category</h2>
              <button onClick={onClose} className="text-muted hover:text-white">
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="space-y-2 mb-6">
              <label htmlFor="categoryName" className="text-sm text-muted block">
                Category Name
              </label>
              <input
                id="categoryName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-neutral-800 text-light border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={onClose} className="text-sm text-muted hover:text-white transition">
                Cancel
              </button>
              <button
                onClick={save}
                disabled={!name.trim()}
                className="text-sm px-4 py-2 bg-accent text-white rounded-lg disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
