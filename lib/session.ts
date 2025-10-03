// lib/session.ts
import type { IronSessionOptions } from 'iron-session';
import type { User } from '@/lib/types/database'; // Suponiendo que tienes un tipo User

// Asegúrate de tener una variable de entorno para el secreto de la sesión
if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET is not set in environment variables. Please add it to your .env.local file. It must be a private string of at least 32 characters.');
}

export const sessionOptions: IronSessionOptions = {
  password: process.env.SESSION_SECRET,
  cookieName: 'delibackoffice-session', // Nombre único para la cookie
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
    httpOnly: true, // La cookie no es accesible desde JavaScript en el cliente
    sameSite: 'lax',
  },
};

// Extiende los tipos de IronSession para incluir la propiedad `user` que almacenaremos.
declare module 'iron-session' {
  interface IronSessionData {
    user?: User;
  }
}
