import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/CreateUserDto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(user: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        email: user.email,
        nickname: user.nickname,
        password: user.password,
      },
    });
  }
}
