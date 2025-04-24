import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Request } from 'express';
import { PostService } from 'src/post/post.service';
import { ProductService } from 'src/product/product.service';

@Controller()
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly postService: PostService,
    private readonly productService: ProductService,
  ) {}

  @Post('post/:id/comment')
  createPostComment(
    @Req() req: Request,
    @Body() createCommentDto: CreateCommentDto,
    @Param('id') postId: string,
  ) {
    const userId = req.user.sub;

    // 없는 유저인지 확인하는 작업을 해줘야 하지만 일단 필터 없는 user면 p2003 예외 발생 해서 제외 함.

    return this.commentService.createPostComment(
      createCommentDto,
      postId,
      userId,
    );
  }

  @Post('product/:id/comment')
  createProductComment(
    @Req() req: Request,
    @Body() createCommentDto: CreateCommentDto,
    @Param('id') productId: string,
  ) {
    const userId = req.user.sub;

    return this.commentService.createProductComment(
      createCommentDto,
      productId,
      userId,
    );
  }

  @Get('post/:id/comment')
  async findAllPostComment(@Param('id') postId: string) {
    // 게시글이 없으면 예외 필터에서 걸러짐.
    const post = await this.postService.findOne(postId);

    return this.commentService.findAllPostComment(postId);
  }

  @Get('product/:id/comment')
  async findAllProductComment(@Param('id') productId: string) {
    // 게시글이 없으면 예외 필터에서 걸러짐.
    const product = await this.productService.findOne(productId);

    return this.commentService.findAllProductComment(productId);
  }

  @Patch('comment/:id')
  update(
    @Param('id') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.update(commentId, updateCommentDto);
  }

  @Delete('comment/:id')
  remove(@Param('id') commentId: string) {
    return this.commentService.remove(commentId);
  }
}
