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
    try {
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
