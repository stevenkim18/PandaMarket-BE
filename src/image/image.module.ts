import { Module } from '@nestjs/common';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        // mac, window 환경이 다르기 때문에 현재 경로를 받아와야 함.
        destination: join(process.cwd(), 'public', 'temp'),
        filename: (req, file, cb) => {
          const split = file.originalname.split('.');

          let extension: string;

          if (split.length > 1) {
            extension = split[split.length - 1];
          } else {
            extension = '';
          }

          cb(null, `${uuidv4()}_${Date.now()}.${extension}`);
        },
      }),
    }),
  ],
  controllers: [ImageController],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}
