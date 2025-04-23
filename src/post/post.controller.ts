import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';

@Controller('post')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly userService: UserService,
  ) {}

  @Post()
  async createPost(@Body() createPostDto: CreatePostDto, @Req() req: Request) {
    const userId = req.user.sub;
    const user = await this.userService.getUserById(userId);

    if (!user) {
      throw new UnauthorizedException('없는 유저 입니다.');
    }

    return this.postService.createPost(createPostDto, user.id);
  }

  @Get()
  findAllPosts(@Query('dateSort') dateSort: 'asc' | 'desc' = 'desc') {
    // TODO: 나중에 좋아요로 정렬 추가
    return this.postService.findAllPosts(dateSort);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(id);
  }

  @Post(':id/like')
  createLike(@Param('id') postId: string, @Req() req: Request) {
    const userId = req.user.sub;

    return this.postService.createLike(postId, userId);
  }

  @Delete(':id/like')
  deleteLike(@Param('id') postId: string, @Req() req: Request) {
    const userId = req.user.sub;

    return this.postService.deleteLike(postId, userId);
  }
}
