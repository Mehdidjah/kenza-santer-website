import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { PresignProductImageDto, SaveProductDto } from './dto';
import { ProductsService } from './products.service';

@Controller()
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get('products')
  listPublic() {
    return this.products.list();
  }

  @Get('products/:id')
  findPublic(@Param('id') id: string) {
    return this.products.findOne(id);
  }

  @Get('admin/products')
  @UseGuards(AdminGuard)
  listAdmin() {
    return this.products.list({ newestFirst: true });
  }

  @Post('admin/products')
  @UseGuards(AdminGuard)
  create(@Body() dto: SaveProductDto) {
    return this.products.create(dto);
  }

  @Put('admin/products/:id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() dto: SaveProductDto) {
    return this.products.update(id, dto);
  }

  @Patch('admin/products/:id')
  @UseGuards(AdminGuard)
  patch(@Param('id') id: string, @Body() dto: SaveProductDto) {
    return this.products.update(id, dto);
  }

  @Delete('admin/products/:id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.products.remove(id);
  }

  @Post('admin/uploads/product-image')
  @UseGuards(AdminGuard)
  createProductImageUpload(@Body() dto: PresignProductImageDto) {
    return this.products.createUploadIntent(dto.fileName, dto.contentType);
  }
}
