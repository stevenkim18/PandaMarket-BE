import {
  IsString,
  IsArray,
  IsNotEmpty,
  minLength,
  MinLength,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  content: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  imageUrls: string[];
}
