import { authStorage } from '@/lib/auth-storage'

// API Response types
interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
}

interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
  code?: string
  statusCode?: number
}

// API Client configuration
interface ApiClientConfig {
  baseURL: string
  timeout?: number
  retries?: number
  retryDelay?: number
}

// Request options
interface RequestOptions extends RequestInit {
  timeout?: number
  skipAuth?: boolean
  retries?: number
}

class ApiClient {
  private config: ApiClientConfig
  private abortControllers = new Map<string, AbortController>()

  constructor(config: ApiClientConfig) {
    this.config = {
      timeout: 30000, // 30 seconds default
      retries: 3,
      retryDelay: 1000,
      ...config,
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private getHeaders(skipAuth = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (!skipAuth) {
      const token = authStorage.getAccessToken()
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }

    return headers
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type')
    const isJson = contentType?.includes('application/json')

    let data: any
    try {
      data = isJson ? await response.json() : await response.text()
    } catch (error) {
      throw new Error('Failed to parse response')
    }

    if (!response.ok) {
      // Handle 401 Unauthorized
      if (response.status === 401) {
        authStorage.clearSession()
        window.location.href = '/signin'
        throw new Error('Session expired. Please sign in again.')
      }

      // Handle other HTTP errors
      const errorMessage =
        data?.message ||
        data?.error ||
        `HTTP ${response.status}: ${response.statusText}`

      const apiError: ApiError = {
        success: false,
        message: errorMessage,
        errors: data?.errors,
        code: data?.code,
        statusCode: response.status,
      }

      throw Object.assign(new Error(errorMessage), apiError)
    }

    return data
  }

  private async requestWithRetry<T>(
    url: string,
    options: RequestOptions,
    attempt = 1,
  ): Promise<T> {
    const retries = options.retries ?? this.config.retries ?? 3

    try {
      return await this.makeRequest<T>(url, options)
    } catch (error) {
      // Only retry on network errors or 5xx status codes
      const shouldRetry =
        attempt < retries &&
        (error instanceof TypeError || // Network error
          (error as any).statusCode >= 500)

      if (shouldRetry) {
        const delay = this.config.retryDelay! * Math.pow(2, attempt - 1) // Exponential backoff
        await this.delay(delay)
        return this.requestWithRetry(url, options, attempt + 1)
      }

      throw error
    }
  }

  private async makeRequest<T>(
    url: string,
    options: RequestOptions,
  ): Promise<T> {
    const requestId = `${options.method || 'GET'}-${url}-${Date.now()}`

    // Create abort controller for timeout and cancellation
    const controller = new AbortController()
    this.abortControllers.set(requestId, controller)

    // Set up timeout
    const timeout = options.timeout ?? this.config.timeout!
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(`${this.config.baseURL}${url}`, {
        ...options,
        headers: {
          ...this.getHeaders(options.skipAuth),
          ...options.headers,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      return await this.handleResponse<T>(response)
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Request timeout')
      }

      throw error
    } finally {
      this.abortControllers.delete(requestId)
    }
  }

  // Public API methods
  async get<T = any>(
    url: string,
    options: Omit<RequestOptions, 'method' | 'body'> = {},
  ): Promise<T> {
    return this.requestWithRetry<T>(url, { ...options, method: 'GET' })
  }

  async post<T = any>(
    url: string,
    data?: any,
    options: Omit<RequestOptions, 'method'> = {},
  ): Promise<T> {
    return this.requestWithRetry<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T = any>(
    url: string,
    data?: any,
    options: Omit<RequestOptions, 'method'> = {},
  ): Promise<T> {
    return this.requestWithRetry<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T = any>(
    url: string,
    data?: any,
    options: Omit<RequestOptions, 'method'> = {},
  ): Promise<T> {
    return this.requestWithRetry<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T = any>(
    url: string,
    options: Omit<RequestOptions, 'method' | 'body'> = {},
  ): Promise<T> {
    return this.requestWithRetry<T>(url, { ...options, method: 'DELETE' })
  }

  // Upload file with progress tracking
  async upload<T = any>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
    options: Omit<RequestOptions, 'method'> = {},
  ): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    // For upload, we don't use JSON content type
    const headers = { ...this.getHeaders(options.skipAuth) }
    delete (headers as any)['Content-Type'] // Let browser set it with boundary

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100
            onProgress(progress)
          }
        })
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            resolve(response)
          } catch (error) {
            reject(new Error('Failed to parse upload response'))
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`))
        }
      }

      xhr.onerror = () => reject(new Error('Upload failed'))
      xhr.ontimeout = () => reject(new Error('Upload timeout'))

      xhr.open('POST', `${this.config.baseURL}${url}`)

      // Set headers
      Object.entries(headers).forEach(([key, value]) => {
        if (value) xhr.setRequestHeader(key, value)
      })

      xhr.timeout = options.timeout ?? this.config.timeout!
      xhr.send(formData)
    })
  }

  // Cancel all pending requests
  cancelAll(): void {
    this.abortControllers.forEach((controller) => controller.abort())
    this.abortControllers.clear()
  }

  // Cancel specific request by pattern
  cancelByPattern(pattern: RegExp): void {
    Array.from(this.abortControllers.keys())
      .filter((key) => pattern.test(key))
      .forEach((key) => {
        const controller = this.abortControllers.get(key)
        controller?.abort()
        this.abortControllers.delete(key)
      })
  }
}

// Create singleton API client instance
const apiClient = new ApiClient({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api',
})

export { apiClient, ApiClient }
export type { ApiResponse, ApiError, RequestOptions }
