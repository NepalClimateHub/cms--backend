import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma-module/prisma.service';
import { CreateResourceDto, UpdateResourceDto, ResourceSearchInput, ResourceResponseDto, ResourceType, ResourceLevel } from '../dto/resource.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ResourceService {
  constructor(private readonly prisma: PrismaService) {}

  async createResource(createResourceDto: CreateResourceDto): Promise<ResourceResponseDto> {
    const { tagIds, ...resourceData } = createResourceDto;
    
    const resource = await (this.prisma as any).resource.create({
      data: {
        ...resourceData,
        tags: tagIds ? { connect: tagIds.map(id => ({ id })) } : undefined,
      },
      include: {
        tags: true,
      },
    });

    return plainToInstance(ResourceResponseDto, resource, { excludeExtraneousValues: true });
  }

  async findAllResources(searchInput: ResourceSearchInput): Promise<{ resources: ResourceResponseDto[]; total: number }> {
    const { offset = 0, limit = 10, ...searchParams } = searchInput;
    const where: any = { deletedAt: null };

    if (searchParams.title) {
        where.title = { contains: searchParams.title, mode: 'insensitive' };
    }
    if (searchParams.type) {
        where.type = searchParams.type;
    }
    if (searchParams.level) {
        where.level = searchParams.level;
    }
    if (searchParams.isDraft !== undefined) {
        where.isDraft = searchParams.isDraft;
    }
    if (searchParams.tagIds && searchParams.tagIds.length > 0) {
        where.tags = { some: { id: { in: searchParams.tagIds } } };
    }

    const [resources, total] = await Promise.all([
        (this.prisma as any).resource.findMany({
            where,
            include: { tags: true },
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'desc' }
        }),
        (this.prisma as any).resource.count({ where })
    ]);

    return {
        resources: plainToInstance(ResourceResponseDto, resources, { excludeExtraneousValues: true }) as unknown as ResourceResponseDto[],
        total,
    };
  }

  async findResourceById(id: string): Promise<ResourceResponseDto> {
      const resource = await (this.prisma as any).resource.findFirst({
          where: { id, deletedAt: null },
          include: { tags: true }
      });
      
      if (!resource) {
          throw new NotFoundException(`Resource with ID ${id} not found`);
      }
      return plainToInstance(ResourceResponseDto, resource, { excludeExtraneousValues: true });
  }

  async updateResource(id: string, updateResourceDto: UpdateResourceDto): Promise<ResourceResponseDto> {
      const { tagIds, ...resourceData } = updateResourceDto;
      
      // Check existence
      await this.findResourceById(id);

      const resource = await (this.prisma as any).resource.update({
          where: { id },
          data: {
              ...resourceData,
              tags: tagIds ? { set: tagIds.map(id => ({ id })) } : undefined,
          },
          include: { tags: true }
      });
      return plainToInstance(ResourceResponseDto, resource, { excludeExtraneousValues: true });
  }

  async deleteResource(id: string): Promise<void> {
      await this.findResourceById(id);
      await (this.prisma as any).resource.update({
          where: { id },
          data: { deletedAt: new Date() }
      });
  }
}
