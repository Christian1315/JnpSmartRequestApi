import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Req,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category-dto';
import { CategoryService } from './category.service';
import { Request } from 'express';

@Controller("categories")
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    // Get all categories
    @Get("")
    getAllCategories() {
        return this.categoryService.getAllCategories();
    }

    // Retrieve category via :id
    @Get('/:id')
    retrieveCategory(@Param('id', ParseIntPipe) id: number) {
        return this.categoryService.getOneCategory(id);
    }

    // Create category
    @Post('')
    createCategory(@Req() req: Request ,@Body() data: CreateCategoryDto) {
        return this.categoryService.createCategory(req, data);
    }

    // Update category
    @Put('/:id')
    updateCategory(
        @Req() req: Request,
        @Param('id', ParseIntPipe) id: number,
        @Body() data: CreateCategoryDto,
    ) {
        return this.categoryService.updateCategory(req, id, data);
    }

    // Delete category
    @Delete('/:id')
    deleteCategory(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
        return this.categoryService.deleteCategory(req, id);
    }
}