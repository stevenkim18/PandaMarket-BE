import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { readdir } from 'fs/promises';
import { rename } from 'fs/promises';
@Injectable()
export class ImageService {
  async checkImagesExist(imageUrls: string[]) {
    const imageFolder = join('public', 'images');
    const tempFolder = join('public', 'temp');
    const files = await readdir(imageFolder);

    let existingImages: string[] = [];
    imageUrls.forEach(async (imageUrl) => {
      if (!files.includes(imageUrl)) {
        const tempfullPath = join(process.cwd(), tempFolder, imageUrl);
        const imagefullPath = join(process.cwd(), imageFolder, imageUrl);
        existingImages.push(join(imageFolder, imageUrl));
        await rename(tempfullPath, imagefullPath);
      }
    });

    return existingImages;
  }
}
