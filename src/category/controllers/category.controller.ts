
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { CreateCategoryDto, UpdateCategoryDto, CategorySearchInput, CategoryResponseDto } from '../dto/category.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/role.decorator';
import { ROLE } from '../../auth/constants/role.constant';
import { BaseApiResponse } from '../../shared/dtos/base-api-response.dto';

@ApiTags('Categories')
@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Roles(ROLE.ADMIN)
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'The category has been successfully created.', type: CategoryResponseDto })
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<BaseApiResponse<CategoryResponseDto>> {
    const data = await this.categoryService.createCategory(createCategoryDto);
    return { data, meta: {} };
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'Return all categories.', type: [CategoryResponseDto] })
  async findAll(@Query() searchInput: CategorySearchInput): Promise<BaseApiResponse<CategoryResponseDto[]>> {
    const { categories, total } = await this.categoryService.findAllCategories(searchInput);
    return { data: categories, meta: { total } };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by id' })
  @ApiResponse({ status: 200, description: 'Return the category.', type: CategoryResponseDto })
  async findOne(@Param('id') id: string): Promise<BaseApiResponse<CategoryResponseDto>> {
    const data = await this.categoryService.findCategoryById(id);
    return { data, meta: {} };
  }

  @Patch(':id')
  @Roles(ROLE.ADMIN)
  @ApiOperation({ summary: 'Update a category' })
  @ApiResponse({ status: 200, description: 'The category has been successfully updated.', type: CategoryResponseDto })
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto): Promise<BaseApiResponse<CategoryResponseDto>> {
    const data = await this.categoryService.updateCategory(id, updateCategoryDto);
    return { data, meta: {} };
  }

  @Delete(':id')
  @Roles(ROLE.ADMIN)
  @ApiOperation({ summary: 'Delete a category' })
  @ApiResponse({ status: 200, description: 'The category has been successfully deleted.' })
  async remove(@Param('id') id: string): Promise<BaseApiResponse<null>> {
    await this.categoryService.deleteCategory(id);
    return { data: null, meta: {} };
  }
}
