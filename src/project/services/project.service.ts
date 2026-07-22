import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../shared/prisma-module/prisma.service";
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectSearchInput,
  ProjectResponseDto,
} from "../dto/project.dto";
import { plainToInstance } from "class-transformer";
import { Prisma } from "@prisma/client";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import { ActivityLogService } from "../../activity-log/activity-log.service";
import { ActivityAction, ActivityEntity } from "@prisma/client";

@Injectable()
export class ProjectService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async createProject(
    createProjectDto: CreateProjectDto,
    ctx?: RequestContext,
  ): Promise<ProjectResponseDto> {
    const { tagIds, ...projectData } = createProjectDto;

    const project = await this.prisma.project.create({
      data: {
        ...projectData,
        tags: tagIds
          ? {
              connect: tagIds.map((id: string) => ({ id })),
            }
          : undefined,
      },
      include: {
        tags: true,
      },
    });

    const _c = plainToInstance(ProjectResponseDto, project);
    if (ctx) this.activityLogService.logActivity(ctx, ActivityAction.CREATE, ActivityEntity.PROJECT, _c.id, _c.title);
    return _c;
  }

  async findAllProjects(
    searchInput: ProjectSearchInput
  ): Promise<{ projects: ProjectResponseDto[]; total: number }> {
    const { offset = 0, limit = 10, ...searchParams } = searchInput;

    const where: Prisma.ProjectWhereInput = {
      deletedAt: null,
    };

    if (searchParams.title) {
      where.title = {
        contains: searchParams.title,
        mode: "insensitive",
      };
    }

    if (searchParams.status) {
      where.status = searchParams.status;
    }

    if (searchParams.isDraft !== undefined) {
      where.isDraft = searchParams.isDraft;
    }

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: {
          tags: true,
        },
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      projects: plainToInstance(ProjectResponseDto, projects),
      total,
    };
  }

  async findProjectById(id: string): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        tags: true,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return plainToInstance(ProjectResponseDto, project);
  }

  async updateProject(
    id: string,
    updateProjectDto: UpdateProjectDto,
    ctx?: RequestContext,
  ): Promise<ProjectResponseDto> {
    const { tagIds, ...projectData } = updateProjectDto;

    const existingProject = await this.prisma.project.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingProject) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const project = await this.prisma.project.update({
      where: { id },
      data: {
        ...projectData,
        tags: tagIds
          ? {
              set: tagIds.map((tagId: string) => ({ id: tagId })),
            }
          : undefined,
      },
      include: {
        tags: true,
      },
    });

    const _u = plainToInstance(ProjectResponseDto, project);
    if (ctx) this.activityLogService.logActivity(ctx, ActivityAction.UPDATE, ActivityEntity.PROJECT, _u.id, _u.title);
    return _u;
  }

  async deleteProject(id: string, ctx?: RequestContext): Promise<void> {
    const existingProject = await this.prisma.project.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingProject) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    await this.prisma.project.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
    if (ctx) this.activityLogService.logActivity(ctx, ActivityAction.DELETE, ActivityEntity.PROJECT, id, existingProject.title);
  }
}
