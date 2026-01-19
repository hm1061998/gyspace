/**
 * HTTP Service - Centralized HTTP request handler with interceptors
 * Handles all API calls with consistent error handling and request/response transformation
 * Refactored to use Axios
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

// Extend AxiosRequestConfig to include custom properties
export interface RequestConfig extends AxiosRequestConfig {
  skipAuthHeader?: boolean;
  skipErrorToast?: boolean;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
}

export type RequestInterceptor = (
  config: InternalAxiosRequestConfig,
) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;

export type ResponseInterceptor = (
  response: AxiosResponse,
) => AxiosResponse | Promise<AxiosResponse>;

export type ErrorInterceptor = (error: any) => any;

class HttpService {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private refreshPromise: Promise<any> | null = null;
  private baseURL: string = (__API_URL__ || "/api").replace(/\/+$/, "");

  constructor() {
    this.instance = axios.create({
      baseURL: this.baseURL,
      withCredentials: true,
      paramsSerializer: {
        serialize: (params) => {
          const searchParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== "") {
              let stringValue = value;
              // Automatically stringify 'filter' if it's an object
              if (key === "filter" && typeof value === "object") {
                const cleanedFilter = Object.entries(value).reduce(
                  (acc, [k, v]) => {
                    if (v !== null && v !== undefined && v !== "") {
                      acc[k] = v;
                    }
                    return acc;
                  },
                  {} as Record<string, any>,
                );

                if (Object.keys(cleanedFilter).length === 0) return;
                stringValue = JSON.stringify(cleanedFilter);
              }
              searchParams.append(key, String(stringValue));
            }
          });
          return searchParams.toString();
        },
      },
    });

    this.setupDefaultInterceptors();
  }

  /**
   * Setup default interceptors for common use cases
   */
  private setupDefaultInterceptors() {
    // Response interceptor: Handle common response transformations and errors
    this.instance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        // Handle 401 Unauthorized for token refresh
        if (axios.isAxiosError(error) && error.response) {
          const originalRequest = error.config as RequestConfig & {
            _retry?: boolean;
          };

          if (
            error.response.status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/auth/refresh") &&
            !originalRequest.url?.includes("/auth/login")
          ) {
            originalRequest._retry = true;
            try {
              return await this.handle401Error(originalRequest);
            } catch (e) {
              return Promise.reject(e);
            }
          }
        }

        // Handle network errors
        if (error.message === "Network Error") {
          console.error("Network error: Unable to connect to server");
        }

        return Promise.reject(error);
      },
    );
  }

  /**
   * Add a request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): number {
    return this.instance.interceptors.request.use(interceptor);
  }

  /**
   * Add a response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): number {
    return this.instance.interceptors.response.use(interceptor);
  }

  /**
   * Add an error interceptor
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): number {
    return this.instance.interceptors.response.use(undefined, interceptor);
  }

  /**
   * Remove an interceptor by ID
   */
  removeInterceptor(type: "request" | "response" | "error", id: number) {
    if (type === "request") {
      this.instance.interceptors.request.eject(id);
    } else {
      this.instance.interceptors.response.eject(id);
    }
  }

  /**
   * Core request method
   */
  async request<T = any>(config: RequestConfig): Promise<HttpResponse<T>> {
    try {
      const response = await this.instance.request<T>(config);

      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        // Enhance error object to ensure compatibility with callers expecting typical error props
        if (error.response) {
          (error as any).status = error.response.status;
          (error as any).statusText = error.response.statusText;
          (error as any).data = error.response.data;
        }
      }
      throw error;
    }
  }

  /**
   * Handle 401 error by attempting to refresh token
   */
  private async handle401Error(originalRequest: RequestConfig): Promise<any> {
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
      try {
        await this.refreshPromise;
        // Retry original request
        return this.request(originalRequest);
      } catch (err) {
        throw err;
      }
    }
  }

  /**
   * GET request
   */
  async get<T = any>(
    url: string,
    params?: Record<string, any>,
    config?: Partial<RequestConfig>,
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      ...config,
      method: "GET",
      url,
      params,
    });
  }

  /**
   * POST request
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: Partial<RequestConfig>,
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      ...config,
      method: "POST",
      url,
      data,
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: Partial<RequestConfig>,
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      ...config,
      method: "PUT",
      url,
      data,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: Partial<RequestConfig>,
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      ...config,
      method: "PATCH",
      url,
      data,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    url: string,
    config?: Partial<RequestConfig>,
  ): Promise<HttpResponse<T>> {
    return this.request<T>({
      ...config,
      method: "DELETE",
      url,
    });
  }

  /**
   * Set base URL
   */
  setBaseURL(baseURL: string) {
    this.baseURL = baseURL;
    this.instance.defaults.baseURL = baseURL;
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
