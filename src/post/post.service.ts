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

  async findAllPosts(dateSort: 'asc' | 'desc') {
    return await this.prisma.board.findMany({
      orderBy: {
        createdAt: dateSort,
      },
    });
  }

  async findOne(id: string) {
    return await this.prisma.board.findUniqueOrThrow({
      where: { id },
    });
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
}
