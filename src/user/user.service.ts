import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/CreateUserDto';
import { LoginUserDto } from './dto/LoginUserDto';
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

    const accessTokenSecret =
      this.configService.get<string>('JWT_ACCESS_SECRET');
    const refreshTokenSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET');

    // password를 제외한 유저 정보
    return {
      accessToken: await this.jwtService.signAsync(
        {
          sub: existingUser.id,
          type: 'access',
        },
        {
          secret: accessTokenSecret,
          expiresIn: '10m',
        },
      ),
      refreshToken: await this.jwtService.signAsync(
        {
          sub: existingUser.id,
          type: 'refresh',
        },
        {
          secret: refreshTokenSecret,
          expiresIn: '1d',
        },
      ),
    };
  }
}
