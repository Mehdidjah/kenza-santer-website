import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminGuard } from './admin.guard';
import { jwtExpiresIn, jwtSecret } from './jwt-options';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: jwtExpiresIn },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AdminGuard],
  exports: [AdminGuard, JwtModule],
})
export class AuthModule {}
