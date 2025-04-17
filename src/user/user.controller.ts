import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'generated/prisma';
import { CreateUserDto } from './dto/CreateUserDto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/signup')
  createUser(@Body() user: CreateUserDto) {
    return this.userService.createUser(user);
  }
}
