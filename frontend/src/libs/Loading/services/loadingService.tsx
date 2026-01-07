import React from "react";
import { createRoot, Root } from "react-dom/client";
import GlobalLoadingUI from "../components/GlobalLoadingUI";

class LoadingService {
  private root: Root | null = null;
  private container: HTMLDivElement | null = null;
  private activeRequests = 0;
  private message = "Đang xử lý...";

  private renderUI(isLoading: boolean) {
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = "loading-root";
      document.body.appendChild(this.container);
      this.root = createRoot(this.container);
    }

    if (this.root) {
      this.root.render(
        <GlobalLoadingUI isLoading={isLoading} message={this.message} />
      );
    }
  }

  show(message?: string) {
    this.activeRequests++;
    if (message) this.message = message;
    else this.message = "Đang xử lý...";

    this.renderUI(true);
  }

  hide() {
    this.activeRequests--;
    if (this.activeRequests <= 0) {
      this.activeRequests = 0;
      this.renderUI(false);
    }
  }
}

export const loadingService = new LoadingService();
