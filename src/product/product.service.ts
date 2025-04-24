import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ImageService } from 'src/image/image.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageService: ImageService,
  ) {}

  async create(createProductDto: CreateProductDto, userId: string) {
    const existingImages = await this.imageService.checkImagesExist(
      createProductDto.imageUrls,
    );

    const product = await this.prisma.product.create({
      data: {
        name: createProductDto.name,
        price: createProductDto.price,
        description: createProductDto.description,
        imageUrls: existingImages,
        tags: createProductDto.tags,
        userId: userId,
      },
    });

    return product;
  }

  findAll(dateSort: 'asc' | 'desc') {
    return this.prisma.product.findMany({
      orderBy: {
        createdAt: dateSort,
      },
    });
  }

  findOne(productId: string) {
    return this.prisma.product.findUniqueOrThrow({
      where: { id: productId },
    });
  }

  update(productId: string, updateProductDto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id: productId },
      data: updateProductDto,
    });
  }

  remove(productId: string) {
    return this.prisma.product.delete({
      where: { id: productId },
    });
  }
}
