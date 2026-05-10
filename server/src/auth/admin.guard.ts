import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { jwtSecret } from './jwt-options';

export interface AdminJwtPayload {
  sub: string;
  email: string;
}

export interface AdminRequest extends Request {
  admin?: AdminJwtPayload;
  cookies: Record<string, string | undefined>;
}

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<AdminRequest>();
    const bearer = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice('Bearer '.length)
      : undefined;
    const token = req.cookies.admin_token ?? bearer;

    if (!token) throw new UnauthorizedException('Admin session required');

    try {
      req.admin = this.jwt.verify<AdminJwtPayload>(token, {
        secret: jwtSecret,
      });
      return true;
    } catch {
      throw new UnauthorizedException('Invalid admin session');
    }
  }
}
