export async function apiRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any,
  token?: string,
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${import.meta.env.BACKEND_URL}${endpoint}`, {
    method,
    headers,
    ...(data && { body: JSON.stringify(data) }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(
      errorData?.message || `HTTP ${response.status}: ${response.statusText}`,
    )
  }

  return response.json()
}
