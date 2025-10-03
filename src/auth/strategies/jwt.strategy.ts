// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'supersecretkey',
    });
  }

  /**
   * validate() is called AFTER the token is successfully verified.
   * The decoded JWT payload is passed here.
   *
   * Whatever we return from validate() is attached to req.user.
   * Return `null` or throw an error to deny access.
   */
  async validate(payload: any) {
    const userId = payload.sub;

    // Fetch the user from DB to ensure they still exist / are active.
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Return an object
    return {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
