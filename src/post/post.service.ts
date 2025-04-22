import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(createPostDto: CreatePostDto, userId: string) {
    try {
      return await this.prisma.board.create({
        data: {
          title: createPostDto.title,
          content: createPostDto.content,
          imageUrls: createPostDto.imageUrls,
          userId,
        },
      });
    } catch (error) {
      if (error && error.name === 'PrismaClientKnownRequestError') {
        if (error.code === 'P2002') {
          throw new InternalServerErrorException('중복된 데이터가 존재합니다.');
        } else if (error.code === 'P2003') {
          throw new InternalServerErrorException(
            '참조 제약 조건 오류가 발생했습니다.',
          );
        }
      }
      throw new InternalServerErrorException(
        '게시글 생성 중 오류가 발생했습니다.',
      );
    }
  }

  async findAllPosts(dateSort: 'asc' | 'desc') {
    try {
      return await this.prisma.board.findMany({
        orderBy: {
          createdAt: dateSort,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        '게시글 목록 조회 중 오류가 발생했습니다.',
      );
    }
  }

  async findOne(id: string) {
    try {
      const post = await this.prisma.board.findUnique({
        where: { id },
      });

      if (!post) {
        throw new NotFoundException('게시글을 찾을 수 없습니다.');
      }

      return post;
    } catch (error) {
      // try문에서 예외가 발생하면 여기서 받음.
      // NotFoundException(404)를 던졌는데 500 오류가 던져짐.
      // 그래서 다시 받아서 그래도 던지도록 함.
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        '게시글 조회 중 오류가 발생했습니다.',
      );
    }
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    try {
      return await this.prisma.board.update({
        where: { id },
        data: updatePostDto,
      });
    } catch (error) {
      if (error && error.name === 'PrismaClientKnownRequestError') {
        if (error.code === 'P2002') {
          throw new InternalServerErrorException('중복된 데이터가 존재합니다.');
        } else if (error.code === 'P2003') {
          throw new InternalServerErrorException(
            '참조 제약 조건 오류가 발생했습니다.',
          );
        } else if (error.code === 'P2025') {
          throw new NotFoundException('수정할 게시글을 찾을 수 없습니다.');
        }
      }
      throw new InternalServerErrorException(
        '게시글 수정 중 오류가 발생했습니다.',
      );
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.board.delete({
        where: { id },
      });
    } catch (error) {
      if (error && error.name === 'PrismaClientKnownRequestError') {
        if (error.code === 'P2025') {
          throw new NotFoundException('삭제할 게시글을 찾을 수 없습니다.');
        }
      }
      throw new InternalServerErrorException(
        '게시글 삭제 중 오류가 발생했습니다.',
      );
    }
  }
}
