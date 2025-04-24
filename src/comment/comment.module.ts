import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PostModule } from 'src/post/post.module';
import { ProductModule } from 'src/product/product.module';
@Module({
  controllers: [CommentController],
  providers: [CommentService],
  imports: [PrismaModule, PostModule, ProductModule],
})
export class CommentModule {}
