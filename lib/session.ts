// lib/session.ts
import type { SessionOptions } from 'iron-session'; // CORRECCIÓN: El nombre correcto es SessionOptions

// Definimos exactamente qué guardaremos en la sesión.
export interface SessionData {
  user?: {
    id: number;
    name: string;
    email: string;
    role: 'admin';
  };
}

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET is not set in environment variables. It must be a private string of at least 32 characters.');
}

export const sessionOptions: SessionOptions = { // CORRECCIÓN: Usar el tipo correcto aquí
  password: process.env.SESSION_SECRET,
  cookieName: 'delibackoffice-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

// Esto extiende los tipos de IronSession para que TypeScript entienda session.user
declare module 'iron-session' {
  interface IronSessionData extends SessionData {}
}
