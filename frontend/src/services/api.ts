const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export async function apiRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  token?: string
) {
  const headers: Record<string, string> = {};
  
  if (body instanceof URLSearchParams) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
  } else if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      headers['Authorization'] = `Bearer ${savedToken}`;
    }
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    if (body instanceof FormData || body instanceof URLSearchParams) {
      config.body = body;
    } else {
      config.body = JSON.stringify(body);
    }
  }

  const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, config);

  if (response.status === 401) {
    // Session expired
    localStorage.removeItem('token');
    if (!window.location.pathname.includes('/login') && window.location.pathname !== '/') {
      window.location.href = '/';
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
  }

  // Handle empty/no-content responses
  if (response.status === 204) {
    return null;
  }

  return response.json();
}
