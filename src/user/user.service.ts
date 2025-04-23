import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user-dto';
import { LoginUserDto } from './dto/login-user-dto';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService, // 환경 변수 사용을 위함.
    private readonly jwtService: JwtService, // JWT 서비스 사용을 위함.
  ) {}

  async createUser(user: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: user.email },
    });

    if (existingUser) {
      throw new BadRequestException('이미 존재하는 이메일입니다.');
    }

    return this.prisma.user.create({
      data: {
        email: user.email,
        nickname: user.nickname,
        password: hashedPassword,
      },
    });
  }

  async login(user: LoginUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!existingUser) {
      throw new BadRequestException('존재하지 않는 이메일입니다.');
    }

    const isPasswordValid = await bcrypt.compare(
      user.password,
      existingUser.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다.');
    }

    return {
      accessToken: await this.issueToken(existingUser, false),
      refreshToken: await this.issueToken(existingUser, true),
    };
  }

  async issueToken(user: { id: string }, isRefreshToken: boolean) {
    const accessTokenSecret =
      this.configService.get<string>('JWT_ACCESS_SECRET');
    const refreshTokenSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET');

    const secret = isRefreshToken ? refreshTokenSecret : accessTokenSecret;
    const expiresIn = isRefreshToken ? '1d' : '10m';

    return this.jwtService.signAsync(
      {
        sub: user.id,
        type: isRefreshToken ? 'refresh' : 'access',
      },
      {
        secret,
        expiresIn,
      },
    );
  }

  async parseBearerToken(rawToken: string, isRefreshToken: boolean) {
    const bearerSplit = rawToken.split(' ');

    // 미들웨어에서 이미 검증하고 있음. 나중에 필요하면 삭제.

    if (bearerSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }

    const [bearer, token] = bearerSplit;

    if (bearer !== 'Bearer') {
      throw new BadRequestException('토큰 타입이 잘못되었습니다.');
    }

    const secret = isRefreshToken
      ? this.configService.get<string>('JWT_REFRESH_SECRET')
      : this.configService.get<string>('JWT_ACCESS_SECRET');

    const payload = await this.jwtService.verifyAsync(token, {
      secret,
    });

    if (isRefreshToken) {
      if (payload.type !== 'refresh') {
        throw new BadRequestException('리프레시 토큰이 아닙니다.');
      }
    } else {
      if (payload.type !== 'access') {
        throw new BadRequestException('엑세스 토큰이 아닙니다.');
      }
    }

    return payload;
  }

  async getUserById(id: string) {
    try {
      return this.prisma.user.findUnique({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException('없는 유저 입니다.');
    }
  }
}
