import { toast } from "sonner";

export const showSuccess = (message: string) => {
  toast.success(message);
};

export const showError = (message: string) => {
  toast.error(message);
};

export const showLoading = (message: string) => {
  return toast.loading(message);
};

// Accept string | number | undefined since sonner may return either
export const dismissToast = (toastId?: string | number) => {
  // sonner's dismiss accepts the id or no args; cast to any to avoid type mismatch
  toast.dismiss(toastId as any);
};