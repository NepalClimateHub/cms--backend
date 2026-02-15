
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma-module/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto, CategorySearchInput, CategoryResponseDto, CategoryType as AppCategoryType } from '../dto/category.dto';
import { plainToInstance } from 'class-transformer';
import { CategoryType as PrismaCategoryType } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async createCategory(createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const category = await (this.prisma as any).category.create({
      data: {
        ...createCategoryDto,
        type: createCategoryDto.type as unknown as PrismaCategoryType,
      },
    });

    return plainToInstance(CategoryResponseDto, category, { excludeExtraneousValues: true });
  }

  async findAllCategories(searchInput: CategorySearchInput): Promise<{ categories: CategoryResponseDto[]; total: number }> {
    const { offset = 0, limit = 10, ...searchParams } = searchInput;
    const where: any = { deletedAt: null };

    if (searchParams.name) {
      where.name = { contains: searchParams.name, mode: 'insensitive' };
    }

    if (searchParams.type) {
      where.type = searchParams.type as unknown as PrismaCategoryType;
    }

    const [categories, total] = await Promise.all([
      (this.prisma as any).category.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      (this.prisma as any).category.count({ where }),
    ]);

    return {
      categories: plainToInstance(CategoryResponseDto, categories, { excludeExtraneousValues: true }) as unknown as CategoryResponseDto[],
      total,
    };
  }

  async findCategoryById(id: string): Promise<CategoryResponseDto> {
    const category = await (this.prisma as any).category.findFirst({
      where: { id, deletedAt: null },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return plainToInstance(CategoryResponseDto, category, { excludeExtraneousValues: true });
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    await this.findCategoryById(id);

    const data: any = { ...updateCategoryDto };
    if (updateCategoryDto.type) {
        data.type = updateCategoryDto.type as unknown as PrismaCategoryType;
    }

    const category = await (this.prisma as any).category.update({
      where: { id },
      data,
    });

    return plainToInstance(CategoryResponseDto, category, { excludeExtraneousValues: true });
  }

  async deleteCategory(id: string): Promise<void> {
    await this.findCategoryById(id);
    await (this.prisma as any).category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
