export interface AuthResponseUser {
  id: string;
  name: string;
  username?: string;
  email: string;
  avatar_url?: string | null;
  profile_img?: string | null;
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

export async function uploadProfileImageApi(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bucket', 'avatars');

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data.url) {
    throw new Error(data.error || 'Failed to upload profile image');
  }
  return data.url;
}

export async function signupApi(params: {
  name: string;
  username?: string;
  email: string;
  password: string;
  profile_img?: string;
  avatar_url?: string;
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
