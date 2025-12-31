export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

type ToastListener = (toasts: ToastMessage[]) => void;

class ToastService {
  private toasts: ToastMessage[] = [];
  private listeners: ToastListener[] = [];

  private notify() {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  subscribe(listener: ToastListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  show(message: string, type: ToastType = "info", duration: number = 3500) {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, message, type };

    this.toasts = [...this.toasts, newToast];
    this.notify();

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  success(message: string) {
    this.show(message, "success");
  }
  error(message: string | string[]) {
    if (Array.isArray(message)) {
      message.forEach((msg) => this.show(msg, "error"));
    } else {
      this.show(message, "error");
    }
  }
  info(message: string) {
    this.show(message, "info");
  }
  warning(message: string) {
    this.show(message, "warning");
  }

  remove(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }
}

export const toast = new ToastService();
