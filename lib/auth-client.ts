export interface AuthResponseUser {
  id: string;
  name: string;
  email: string;
  description?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthApiResponse {
  message?: string;
  error?: string;
  user?: AuthResponseUser;
}

export async function loginApi(credentials: {
  identifier: string;
  password: string;
}): Promise<AuthApiResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to log in.');
  }
  return data;
}

export async function signupApi(params: {
  name: string;
  email: string;
  password: string;
  description?: string;
}): Promise<AuthApiResponse> {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to sign up.');
  }
  return data;
}

export async function logoutApi(): Promise<{ message?: string; error?: string }> {
  const res = await fetch('/api/auth/logout', {
    method: 'POST',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to log out.');
  }
  return data;
}

export async function getMeApi(): Promise<{ user?: AuthResponseUser; error?: string }> {
  const res = await fetch('/api/auth/me');
  if (!res.ok) {
    return { error: 'Not authenticated' };
  }
  return await res.json();
}
