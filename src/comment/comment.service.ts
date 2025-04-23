import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  create(createCommentDto: CreateCommentDto, postId: string, userId: string) {
    return this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        boardId: postId,
        userId,
      },
    });
  }

  findAll(postId: string) {
    return this.prisma.comment.findMany({
      where: {
        boardId: postId,
      },
      orderBy: {
        createdAt: 'desc',
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
