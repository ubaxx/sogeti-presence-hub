type Toast = {
  id: string;
  message: string;
};

const listeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

export function subscribeToast(fn: (t: Toast[]) => void) {
  listeners.push(fn);
}

export function showToast(message: string) {
  const toast: Toast = {
    id: crypto.randomUUID(),
    message
  };

  toasts = [...toasts, toast];
  listeners.forEach((l) => l(toasts));

  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== toast.id);
    listeners.forEach((l) => l(toasts));
  }, 3000);
}