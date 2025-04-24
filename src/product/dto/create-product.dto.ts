import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsNumber,
  IsArray,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  name: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  description: string;

  @IsArray()
  @IsString({ each: true })
  imageUrls: string[];

  @IsArray()
  @IsString({ each: true })
  tags: string[];
}
