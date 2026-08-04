import { apiRequest } from './api';

export async function loginUser(email: string, password: string): Promise<{ access_token: string; token_type: string }> {
  const params = new URLSearchParams();
  params.append('username', email);
  params.append('password', password);

  return apiRequest('/login/access-token', 'POST', params);
}

export async function registerUser(email: string, password: string, fullName?: string) {
  return apiRequest('/users/', 'POST', {
    email,
    password,
    full_name: fullName || null,
    is_active: true,
    is_superuser: false
  });
}

export function getEmailFromToken(token: string): string | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    return payload.sub || null;
  } catch (e) {
    return null;
  }
}
