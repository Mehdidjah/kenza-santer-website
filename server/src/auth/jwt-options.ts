import type { SignOptions } from 'jsonwebtoken';

export const jwtSecret = process.env.JWT_SECRET ?? 'change-me-in-railway';
export const jwtExpiresIn = (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'];
