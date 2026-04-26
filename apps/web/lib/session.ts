import { cookies } from 'next/headers';
import { Role } from '@repo/db';

export interface UserSession {
  sub: string;
  email: string;
  role: Role;
}

export async function getUserSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return null;
  }

  try {
    // A JWT has 3 parts: Header, Payload, Signature
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return null;
    
    const decodedPayload = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    const session = JSON.parse(decodedPayload) as UserSession;
    
    return session;
  } catch (error) {
    console.error('Failed to decode user session:', error);
    return null;
  }
}
