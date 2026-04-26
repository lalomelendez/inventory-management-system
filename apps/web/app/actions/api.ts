'use server';

import { cookies } from 'next/headers';

export async function proxyApi(endpoint: string, options?: { method?: string, body?: any }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  if (options?.body) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`http://127.0.0.1:3001${endpoint}`, {
    method: options?.method || 'GET',
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: `HTTP Error: ${res.status}` }));
    throw new Error(errorData.message || 'API Request Failed');
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
}
