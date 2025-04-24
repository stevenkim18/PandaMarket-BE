import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ImageModule } from 'src/image/image.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [ImageModule, PrismaModule],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
