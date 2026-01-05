/**
 * HTTP Service - Centralized HTTP request handler with interceptors
 * Handles all API calls with consistent error handling and request/response transformation
 */

export interface RequestConfig extends RequestInit {
  url: string;
  params?: Record<string, any>;
  skipAuthHeader?: boolean;
  skipErrorToast?: boolean;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

type RequestInterceptor = (
  config: RequestConfig
) => RequestConfig | Promise<RequestConfig>;
type ResponseInterceptor = <T>(
  response: HttpResponse<T>
) => HttpResponse<T> | Promise<HttpResponse<T>>;
type ErrorInterceptor = (error: any) => any;

class HttpService {
  private baseURL: string = "/api";
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];
  private isRefreshing = false;
  private refreshPromise: Promise<any> | null = null;

  constructor() {
    // Setup default interceptors
    this.setupDefaultInterceptors();
  }

  /**
   * Setup default interceptors for common use cases
   */
  private setupDefaultInterceptors() {
    // Request interceptor: Add default headers
    this.addRequestInterceptor((config) => {
      const headers = new Headers(config.headers);

      // Add Content-Type if not present and body exists
      if (config.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      // Always include credentials for cookie-based auth
      config.credentials = config.credentials || "include";

      // Add custom headers here if needed
      // Example: headers.set("X-App-Version", "1.0.0");

      return {
        ...config,
        headers,
      };
    });

    // Response interceptor: Handle common response transformations
    this.addResponseInterceptor(async (response) => {
      // You can add common response transformations here
      return response;
    });

    // Error interceptor: Handle common errors
    this.addErrorInterceptor((error) => {
      // Handle network errors
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        console.error("Network error: Unable to connect to server");
      }

      // Re-throw the error for the caller to handle
      throw error;
    });
  }

  /**
   * Add a request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
    return this.requestInterceptors.length - 1;
  }

  /**
   * Add a response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
    return this.responseInterceptors.length - 1;
  }

  /**
   * Add an error interceptor
   */
  addErrorInterceptor(interceptor: ErrorInterceptor) {
    this.errorInterceptors.push(interceptor);
    return this.errorInterceptors.length - 1;
  }

  /**
   * Remove an interceptor by index
   */
  removeInterceptor(type: "request" | "response" | "error", index: number) {
    if (type === "request") {
      this.requestInterceptors.splice(index, 1);
    } else if (type === "response") {
      this.responseInterceptors.splice(index, 1);
    } else if (type === "error") {
      this.errorInterceptors.splice(index, 1);
    }
  }

  /**
   * Build URL with query parameters
   */
  private buildURL(url: string, params?: Record<string, any>): string {
    const fullURL = url.startsWith("http") ? url : `${this.baseURL}${url}`;

    if (!params || Object.keys(params).length === 0) {
      return fullURL;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      // Skip null, undefined, and empty strings
      if (value !== null && value !== undefined && value !== "") {
        let stringValue = value;
        // Automatically stringify 'filter' if it's an object
        if (key === "filter" && typeof value === "object") {
          const cleanedFilter = Object.entries(value).reduce((acc, [k, v]) => {
            if (v !== null && v !== undefined && v !== "") {
              acc[k] = v;
            }
            return acc;
          }, {} as Record<string, any>);

          if (Object.keys(cleanedFilter).length === 0) return;
          stringValue = JSON.stringify(cleanedFilter);
        }
        searchParams.append(key, String(stringValue));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${fullURL}?${queryString}` : fullURL;
  }

  /**
   * Execute request interceptors
   */
  private async executeRequestInterceptors(
    config: RequestConfig
  ): Promise<RequestConfig> {
    let modifiedConfig = config;

    for (const interceptor of this.requestInterceptors) {
      modifiedConfig = await interceptor(modifiedConfig);
    }

    return modifiedConfig;
  }

  /**
   * Execute response interceptors
   */
  private async executeResponseInterceptors<T>(
    response: HttpResponse<T>
  ): Promise<HttpResponse<T>> {
    let modifiedResponse = response;

    for (const interceptor of this.responseInterceptors) {
      modifiedResponse = await interceptor(modifiedResponse);
    }

    return modifiedResponse;
  }

  /**
   * Execute error interceptors
   */
  private async executeErrorInterceptors(error: any): Promise<any> {
    let modifiedError = error;

    for (const interceptor of this.errorInterceptors) {
      try {
        modifiedError = await interceptor(modifiedError);
      } catch (e) {
        modifiedError = e;
      }
    }

    return modifiedError;
  }

  /**
   * Core request method
   */
  async request<T = any>(config: RequestConfig): Promise<HttpResponse<T>> {
    try {
      // Execute request interceptors
      const modifiedConfig = await this.executeRequestInterceptors(config);

      // Build full URL with params
      const url = this.buildURL(modifiedConfig.url, modifiedConfig.params);

      // Make the request
      const response = await fetch(url, {
        method: modifiedConfig.method || "GET",
        headers: modifiedConfig.headers,
        body: modifiedConfig.body,
        credentials: modifiedConfig.credentials,
        signal: modifiedConfig.signal,
      });

      // Parse response
      let data: T;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = (await response.text()) as any;
      }

      // Check if response is ok
      if (!response.ok) {
        // Handle 401 Unauthorized for token refresh
        if (
          response.status === 401 &&
          !config.url.includes("/auth/refresh") &&
          !config.url.includes("/auth/login")
        ) {
          return await this.handle401Error(config);
        }

        const error: any = new Error(
          (data as any)?.message || response.statusText
        );
        error.status = response.status;
        error.statusText = response.statusText;
        error.data = data;
        throw error;
      }

      // Build response object
      const httpResponse: HttpResponse<T> = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };

      // Execute response interceptors
      return await this.executeResponseInterceptors(httpResponse);
    } catch (error: any) {
      // Handle potential 401 error that might be thrown (e.g. from fetch directly in some envs)
      if (
        error.status === 401 &&
        !config.url.includes("/auth/refresh") &&
        !config.url.includes("/auth/login")
      ) {
        return await this.handle401Error(config);
      }
      // Execute error interceptors
      await this.executeErrorInterceptors(error);
      throw error; // Re-throw after interceptors
    }
  }

  /**
   * Handle 401 error by attempting to refresh token
   */
  private async handle401Error(config: RequestConfig): Promise<any> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshPromise = this.post("/auth/refresh", {})
        .then(() => {
          this.isRefreshing = false;
          this.refreshPromise = null;
        })
        .catch((err) => {
          this.isRefreshing = false;
          this.refreshPromise = null;

          // Redirect to login if refresh fails
          // We use dynamic imports to avoid circular dependencies
          import("../../redux/authSlice").then(({ logout }) => {
            import("../../redux/store").then(({ store }) => {
              store.dispatch(logout());
            });
          });
          throw err;
        });
    }

    if (this.refreshPromise) {
      await this.refreshPromise;
      return this.request(config); // Retry original request
    }
  }

  /**
   * GET request
   */
  async get<T = any>(
    url: string,
    params?: Record<string, any>,
    config?: Partial<RequestConfig>
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      url,
      params,
      method: "GET",
      ...config,
    });
  }

  /**
   * POST request
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: Partial<RequestConfig>
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      url,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: Partial<RequestConfig>
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      url,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: Partial<RequestConfig>
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      url,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    url: string,
    config?: Partial<RequestConfig>
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      url,
      method: "DELETE",
      ...config,
    });
  }

  /**
   * Set base URL
   */
  setBaseURL(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Get base URL
   */
  getBaseURL(): string {
    return this.baseURL;
  }
}

// Export singleton instance
export const http = new HttpService();

// Export class for creating custom instances if needed
export { HttpService };
