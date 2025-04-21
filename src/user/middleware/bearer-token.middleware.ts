import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('토큰이 없습니다.');
    }

    const token = this.vaildateBearerToken(authHeader);

    try {
      // decode는 토큰을 검증을 하지 않고 파싱만 함.
      const decodedPayload = this.jwtService.decode(token);

      if (
        decodedPayload.type !== 'access' &&
        decodedPayload.type !== 'refresh'
      ) {
        throw new UnauthorizedException('토큰이 형식이 잘못되었습니다.');
      }

      const secret =
        decodedPayload.type === 'access'
          ? this.configService.get('JWT_ACCESS_SECRET')
          : this.configService.get('JWT_REFRESH_SECRET');

      const payload = await this.jwtService.verifyAsync(token, {
        secret,
      });

      req.user = payload;
      next();
    } catch (error) {
      throw new UnauthorizedException('유효하지 않는 토큰입니다.');
    }
  }

  vaildateBearerToken(rawToken: string) {
    const bearerSplit = rawToken.split(' ');

    if (bearerSplit.length !== 2) {
      throw new UnauthorizedException('토큰이 형식이 잘못되었습니다.');
    }

    const [bearer, token] = bearerSplit;

    if (bearer !== 'Bearer') {
      throw new UnauthorizedException('토큰이 형식이 잘못되었습니다.');
    }

    return token;
  }
}
