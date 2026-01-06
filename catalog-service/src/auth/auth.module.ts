import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'youshop-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [JwtStrategy, RolesGuard],
  exports: [PassportModule, JwtModule, RolesGuard],
})
export class AuthModule {}
