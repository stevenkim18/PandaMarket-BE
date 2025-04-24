import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Request } from 'express';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto, @Req() req: Request) {
    const userId = req.user.sub;
    return this.productService.create(createProductDto, userId);
  }

  @Get()
  findAll(@Query('dateSort') dateSort: 'asc' | 'desc') {
    return this.productService.findAll(dateSort);
  }

  @Get(':id')
  findOne(@Param('id') productId: string) {
    return this.productService.findOne(productId);
  }

  @Patch(':id')
  update(
    @Param('id') productId: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(productId, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') productId: string) {
    return this.productService.remove(productId);
  }
}
