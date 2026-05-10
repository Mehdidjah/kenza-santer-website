import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { jwtExpiresIn, jwtSecret } from './jwt-options';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.adminUser.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const valid = await compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    const token = await this.jwt.signAsync(
      { sub: user.id, email: user.email },
      {
        secret: jwtSecret,
        expiresIn: jwtExpiresIn,
      },
    );

    return {
      token,
      user: { id: user.id, email: user.email },
    };
  }
}
