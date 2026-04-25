'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  // 1. Extract and validate data
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  // 2. The Network Call to our NestJS Vault
  const response = await fetch('http://127.0.0.1:3001/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Invalid credentials');
  }

  const data = await response.json();

  // 3. Securely store the VIP Wristband
  (await cookies()).set('token', data.access_token, {
    httpOnly: true, // Invisible to hackers
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  });

  // 4. Redirect to the secure operations dashboard
  redirect('/'); // Redirecting to Home where products are listed
}
