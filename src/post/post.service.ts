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

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(createPostDto: CreatePostDto, userId: string) {
    const imageFolder = join('public', 'images');
    const tempFolder = join('public', 'temp');
    const files = await readdir(imageFolder);

    let existingImages: string[] = [];
    // temp 폴더 안에 파일이 있으면 -> 미리 업로드 한 파일 -> 이미지 폴더로 이동(나중에는 S3로 이동할 파일들)
    createPostDto.imageUrls.forEach(async (imageUrl) => {
      if (!files.includes(imageUrl)) {
        const tempfullPath = join(process.cwd(), tempFolder, imageUrl);
        const imagefullPath = join(process.cwd(), imageFolder, imageUrl);
        existingImages.push(join(imageFolder, imageUrl));
        await rename(tempfullPath, imagefullPath);
      }
    });

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
