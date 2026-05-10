import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { AdminGuard, type AdminRequest } from './admin.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto';

const sameSite = (process.env.COOKIE_SAME_SITE ?? (process.env.NODE_ENV === 'production' ? 'none' : 'lax')) as 'lax' | 'strict' | 'none';
const cookieOptions = {
  httpOnly: true,
  sameSite,
  secure: process.env.NODE_ENV === 'production' || sameSite === 'none',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};
const clearCookieOptions = {
  path: '/',
  sameSite,
  secure: cookieOptions.secure,
};

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.login(dto.email, dto.password);
    res.cookie('admin_token', result.token, cookieOptions);
    return { user: result.user, token: result.token };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('admin_token', clearCookieOptions);
    return { ok: true };
  }

  @Get('me')
  @UseGuards(AdminGuard)
  me(@Req() req: AdminRequest) {
    return { user: req.admin };
  }
}
