import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Tell the bouncer to look in the "Authorization: Bearer <token>" header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // This MUST match the secret you used in Phase 3!
      secretOrKey: 'MY_SUPER_SECRET_KEY_DONT_SHARE', 
    });
  }

  // If the signature is valid, NestJS automatically calls this function.
  // Whatever you return here gets attached to the request as `req.user`.
  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
