export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface ConfirmState {
  isOpen: boolean;
  options: ConfirmOptions;
  isProcessing: boolean;
}

type ConfirmListener = (state: ConfirmState) => void;
type ResolveFunction = (value: boolean) => void;

class ConfirmService {
  private state: ConfirmState = {
    isOpen: false,
    options: { message: "" },
    isProcessing: false,
  };
  private listeners: ConfirmListener[] = [];
  private resolver: ResolveFunction | null = null;

  private notify() {
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }

  subscribe(listener: ConfirmListener) {
    this.listeners.push(listener);
    // Immediately notify with current state
    listener({ ...this.state });
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  show(options: ConfirmOptions): Promise<boolean> {
    this.state = {
      isOpen: true,
      options,
      isProcessing: false,
    };
    this.notify();

    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  async handleConfirm() {
    if (this.state.options.onConfirm) {
      this.state.isProcessing = true;
      this.notify();

      try {
        await this.state.options.onConfirm();
        this.close(true);
      } catch (error) {
        // Don't close modal on error, let user retry or cancel
        this.state.isProcessing = false;
        this.notify();
        console.error("Confirm action failed:", error);
      }
    } else {
      this.close(true);
    }
  }

  handleCancel() {
    if (this.state.isProcessing) return;

    if (this.state.options.onCancel) {
      this.state.options.onCancel();
    }
    this.close(false);
  }

  private close(result: boolean) {
    this.state = {
      isOpen: false,
      options: { message: "" },
      isProcessing: false,
    };
    this.notify();
    this.resolver?.(result);
    this.resolver = null;
  }

  // Convenience methods
  danger(message: string, title?: string): Promise<boolean> {
    return this.show({
      message,
      title: title || "Xác nhận",
      type: "danger",
      confirmText: "Xác nhận",
      cancelText: "Hủy",
    });
  }

  warning(message: string, title?: string): Promise<boolean> {
    return this.show({
      message,
      title: title || "Cảnh báo",
      type: "warning",
      confirmText: "Xác nhận",
      cancelText: "Hủy",
    });
  }

  info(message: string, title?: string): Promise<boolean> {
    return this.show({
      message,
      title: title || "Thông báo",
      type: "info",
      confirmText: "Xác nhận",
      cancelText: "Hủy",
    });
  }
}

export const confirmService = new ConfirmService();
