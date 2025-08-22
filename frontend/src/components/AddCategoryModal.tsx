import { createCategory, fetchCategories } from "@/store/category/categoryAction";
import { AppDispatch } from "@/store/store";
import {
  Dialog,
  DialogBackdrop,
  Transition,
  TransitionChild,
  DialogPanel,
} from "@headlessui/react";
import { ChevronRight } from "lucide-react";
import { Fragment, useState } from "react";
import { useDispatch } from "react-redux";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddCategoryModal({ isOpen, onClose }: Props) {
  const [name, setName] = useState("");
  const dispatch = useDispatch<AppDispatch>();

  const save = async () => {
    if (!name.trim()) return;
    await dispatch(createCategory({ name: name.trim() }));
    await dispatch(fetchCategories());
    setName("");
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
              <h2 className="text-lg font-semibold text-light">Add New Category</h2>
              <button onClick={onClose} className="text-muted hover:text-white">
                <ChevronRight size={20} />
              </button>
            </header>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted mb-1">Category Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cocktails"
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-light focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={!name.trim()}
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
