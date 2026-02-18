const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

interface RequestOptions extends RequestInit {
  token?: string
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { token, headers = {}, ...fetchOptions } = options

    const config: RequestInit = {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config)

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(`API Error: ${response.status} - ${errorText}`)
    }

    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      return response.json()
    }

    return {} as T
  }

  async get<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', token })
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    token?: string
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      token,
    })
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    token?: string
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      token,
    })
  }

  async delete<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', token })
  }
}

export const apiClient = new ApiClient(API_URL)
