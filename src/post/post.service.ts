import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { readdir, rename } from 'fs/promises';
import { join } from 'path';
import { ImageService } from 'src/image/image.service';
@Injectable()
export class PostService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageService: ImageService,
  ) {}

  async createPost(createPostDto: CreatePostDto, userId: string) {
    const existingImages = await this.imageService.checkImagesExist(
      createPostDto.imageUrls,
    );

    const board = await this.prisma.board.create({
      data: {
        title: createPostDto.title,
        content: createPostDto.content,
        imageUrls: existingImages,
        userId,
      },
    });

    // 이미지 경로를 반환 할 때, full path를 반환하도록 수정 -> S3 사용 할 때.
    return board;
  }

  async findAllPosts(dateSort: 'asc' | 'desc', userId?: string) {
    const posts = await this.prisma.board.findMany({
      orderBy: {
        createdAt: dateSort,
      },
      select: {
        id: true,
        title: true,
        content: true,
        imageUrls: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            BoardLike: true,
          },
        },
        ...(userId && {
          BoardLike: {
            where: {
              userId,
            },
            select: {
              userId: true,
            },
          },
        }),
      },
    });

    return posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      imageUrls: post.imageUrls,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      likeCount: post._count.BoardLike,
      isLiked: userId ? post.BoardLike.length > 0 : false,
    }));
  }

  async findOne(id: string, userId?: string) {
    const post = await this.prisma.board.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        imageUrls: true,
        createdAt: true,
        updatedAt: true,
        // 좋아요 개수
        _count: {
          select: {
            BoardLike: true,
          },
        },
        ...(userId && {
          BoardLike: {
            where: {
              userId,
            },
            select: {
              userId: true,
            },
          },
        }),
      },
    });

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      imageUrls: post.imageUrls,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      likeCount: post._count.BoardLike,
      isLiked: userId ? post.BoardLike.length > 0 : false,
    };
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    return await this.prisma.board.update({
      where: { id },
      data: updatePostDto,
    });
  }

  async remove(id: string) {
    return await this.prisma.board.delete({
      where: { id },
    });
  }

  async createLike(postId: string, userId: string) {
    return await this.prisma.boardLike.create({
      data: {
        boardId: postId,
        userId,
      },
    });
  }

  async deleteLike(postId: string, userId: string) {
    return await this.prisma.boardLike.delete({
      where: {
        userId_boardId: {
          userId,
          boardId: postId,
        },
      },
    });
  }
}
