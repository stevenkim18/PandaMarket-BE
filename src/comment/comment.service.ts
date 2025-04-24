import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  createPostComment(
    createCommentDto: CreateCommentDto,
    postId: string,
    userId: string,
  ) {
    return this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        boardId: postId,
        userId,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  createProductComment(
    createCommentDto: CreateCommentDto,
    productId: string,
    userId: string,
  ) {
    return this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        productId: productId,
        userId,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        productId: true,
      },
    });
  }

  findAllPostComment(postId: string) {
    return this.prisma.comment.findMany({
      where: {
        boardId: postId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        boardId: true,
      },
    });
  }

  findAllProductComment(productId: string) {
    return this.prisma.comment.findMany({
      where: {
        productId: productId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        productId: true,
      },
    });
  }

  update(commentId: string, updateCommentDto: UpdateCommentDto) {
    return this.prisma.comment.update({
      where: { id: commentId },
      data: updateCommentDto,
    });
  }

  remove(commentId: string) {
    return this.prisma.comment.delete({
      where: { id: commentId },
    });
  }
}
