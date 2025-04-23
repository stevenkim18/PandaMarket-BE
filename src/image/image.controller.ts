import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ImageService } from './image.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('/single')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 1024 * 1024 * 6, // 3MB
      },
      fileFilter: (req, file, cb) => {
        if (
          file.mimetype === 'image/jpeg' ||
          file.mimetype === 'image/png' ||
          file.mimetype === 'image/jpg' ||
          file.mimetype === 'image/gif'
        ) {
          cb(null, true); // callback에 에러 타입과 파일을 저장할지 여부를 지정
        } else {
          cb(
            new BadRequestException(
              '이미지 형식이 올바르지 않습니다. jpg, png, gif',
            ),
            false,
          );
        }
      },
    }),
  ) // 여기 이름이랑 form-data 이름이랑 같아야 함.
  async uploadSingleImage(@UploadedFile() image: Express.Multer.File) {
    if (!image) {
      throw new BadRequestException('이미지가 없습니다.');
    }

    return {
      filename: image.filename,
    };
  }
}
