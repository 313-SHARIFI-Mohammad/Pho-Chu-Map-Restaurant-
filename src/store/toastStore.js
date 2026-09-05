import { create } from "zustand";

let idCounter = 0;

const useToastStore = create((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = ++idCounter;
    const item = { id, type: toast.type || "info", message: toast.message };
    set((state) => ({ toasts: [...state.toasts, item] }));
    window.setTimeout(() => {
      useToastStore.getState().removeToast(id);
    }, toast.duration || 3500);
    return id;
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

function toast(message, type = "info", duration = 3500) {
  return useToastStore.getState().addToast({ message, type, duration });
}

toast.success = (message) => toast(message, "success");
toast.error = (message) => toast(message, "error");
toast.info = (message) => toast(message, "info");

export { useToastStore, toast };
