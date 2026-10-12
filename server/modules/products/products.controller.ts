import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import type {
  Product,
  ProductListParams,
  CreateProductDto,
  UpdateProductDto,
  CategoryItem,
} from '@shared/api.interface';

@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Query() params: ProductListParams): Promise<Product[]> {
    return this.productsService.findAll(params);
  }

  @Get('categories')
  async getCategories(): Promise<CategoryItem[]> {
    return this.productsService.getCategories();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateProductDto): Promise<Product> {
    return this.productsService.create(dto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.productsService.remove(id);
  }
}
