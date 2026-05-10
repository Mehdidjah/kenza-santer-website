import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { CategoriesService } from './categories.service';
import { SaveCategoryDto } from './dto';

@Controller()
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get('categories')
  listPublic() {
    return this.categories.list();
  }

  @Get('admin/categories')
  @UseGuards(AdminGuard)
  listAdmin() {
    return this.categories.list();
  }

  @Post('admin/categories')
  @UseGuards(AdminGuard)
  create(@Body() dto: SaveCategoryDto) {
    return this.categories.create(dto);
  }

  @Put('admin/categories/:id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() dto: SaveCategoryDto) {
    return this.categories.update(id, dto);
  }

  @Delete('admin/categories/:id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.categories.remove(id);
  }
}
