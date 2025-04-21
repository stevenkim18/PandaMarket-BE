import { Body, Controller, Headers, HttpCode, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/CreateUserDto';
import { LoginUserDto } from './dto/LoginUserDto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/signup')
  createUser(@Body() user: CreateUserDto) {
    return this.userService.createUser(user);
  }

  @Post('/login')
  @HttpCode(200)
  login(@Body() user: LoginUserDto) {
    return this.userService.login(user);
  }

  @Post('/token/access')
  @HttpCode(200)
  async rotateAccessToken(@Headers('authorization') token: string) {
    // refresh token을 사용해서 access token을 갱신.
    const payload = await this.userService.parseBearerToken(token, true);
    const userId = payload.sub;

    return {
      accessToken: await this.userService.issueToken({ id: userId }, false),
    };
  }
}
