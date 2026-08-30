import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma-module/prisma.service";
import {
  CreateVacancyDto,
  UpdateVacancyDto,
  VacancySearchInput,
  VacancyResponseDto,
  CreateVacancyApplicationDto,
  VacancyApplicationResponseDto,
  UpdateApplicationStatusDto,
} from "../dto/vacancy.dto";
import { plainToInstance } from "class-transformer";
import { Prisma } from "@prisma/client";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import { ActivityLogService } from "../../activity-log/activity-log.service";
import { ActivityAction, ActivityEntity } from "@prisma/client";

@Injectable()
export class VacancyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogService: ActivityLogService,
  ) { }

  async createVacancy(
    createVacancyDto: CreateVacancyDto,
    ctx?: RequestContext,
  ): Promise<VacancyResponseDto> {
    const vacancy = await this.prisma.vacancy.create({
      data: {
        title: createVacancyDto.title,
        openings: createVacancyDto.openings ?? 1,
        duration: createVacancyDto.duration,
        hoursPerWeek: createVacancyDto.hoursPerWeek,
        overview: createVacancyDto.overview,
        responsibilities: createVacancyDto.responsibilities ?? [],
        requirements: createVacancyDto.requirements ?? [],
        location: createVacancyDto.location,
        type: createVacancyDto.type,
        deadline: createVacancyDto.deadline
          ? new Date(createVacancyDto.deadline)
          : null,
        isActive: createVacancyDto.isActive ?? true,
        isDraft: createVacancyDto.isDraft ?? false,
      },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    const _v = plainToInstance(VacancyResponseDto, vacancy);
    if (ctx) {
      this.activityLogService.logActivity(
        ctx,
        ActivityAction.CREATE,
        ActivityEntity.VACANCY,
        _v.id,
        _v.title,
      );
    }
    return _v;
  }

  async findAllVacancies(
    searchInput: VacancySearchInput,
  ): Promise<{ vacancies: VacancyResponseDto[]; total: number }> {
    const { offset = 0, limit = 10, search, isActive, type } = searchInput;

    const where: Prisma.VacancyWhereInput = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          overview: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (typeof isActive === "boolean") {
      where.isActive = isActive;
    }

    if (type) {
      where.type = type;
    }

    const [vacancies, total] = await Promise.all([
      this.prisma.vacancy.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { applications: true },
          },
        },
      }),
      this.prisma.vacancy.count({ where }),
    ]);

    return {
      vacancies: plainToInstance(
        VacancyResponseDto,
        vacancies,
      ) as unknown as VacancyResponseDto[],
      total,
    };
  }

  async findVacancyById(id: string): Promise<VacancyResponseDto> {
    const vacancy = await this.prisma.vacancy.findFirst({
      where: { id, deletedAt: null },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!vacancy) {
      throw new NotFoundException(`Vacancy with ID ${id} not found`);
    }

    return plainToInstance(VacancyResponseDto, vacancy);
  }

  async updateVacancy(
    id: string,
    updateVacancyDto: UpdateVacancyDto,
    ctx?: RequestContext,
  ): Promise<VacancyResponseDto> {
    const existing = await this.prisma.vacancy.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Vacancy with ID ${id} not found`);
    }

    const vacancy = await this.prisma.vacancy.update({
      where: { id },
      data: {
        ...updateVacancyDto,
        deadline: updateVacancyDto.deadline
          ? new Date(updateVacancyDto.deadline)
          : updateVacancyDto.deadline === null
            ? null
            : existing.deadline,
      },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    const _v = plainToInstance(VacancyResponseDto, vacancy);
    if (ctx) {
      this.activityLogService.logActivity(
        ctx,
        ActivityAction.UPDATE,
        ActivityEntity.VACANCY,
        _v.id,
        _v.title,
      );
    }
    return _v;
  }

  async deleteVacancy(id: string, ctx?: RequestContext): Promise<void> {
    const existing = await this.prisma.vacancy.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Vacancy with ID ${id} not found`);
    }

    await this.prisma.vacancy.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    if (ctx) {
      this.activityLogService.logActivity(
        ctx,
        ActivityAction.DELETE,
        ActivityEntity.VACANCY,
        id,
        existing.title,
      );
    }
  }

  async applyToVacancy(
    vacancyId: string,
    dto: CreateVacancyApplicationDto,
  ): Promise<VacancyApplicationResponseDto> {
    const vacancy = await this.prisma.vacancy.findFirst({
      where: { id: vacancyId, deletedAt: null, isActive: true },
    });

    if (!vacancy) {
      throw new NotFoundException(
        `Active vacancy with ID ${vacancyId} not found or closed`,
      );
    }

    const application = await this.prisma.vacancyApplication.create({
      data: {
        vacancyId,
        fullName: dto.fullName,
        email: dto.email,
        contact: dto.contact,
        currentAddress: dto.currentAddress,
        message: dto.message,
        cvUrl: dto.cvUrl,
        cvFileId: dto.cvFileId,
      },
    });

    return plainToInstance(VacancyApplicationResponseDto, application);
  }

  async findVacancyApplications(
    vacancyId: string,
  ): Promise<VacancyApplicationResponseDto[]> {
    const vacancy = await this.prisma.vacancy.findFirst({
      where: { id: vacancyId, deletedAt: null },
    });

    if (!vacancy) {
      throw new NotFoundException(`Vacancy with ID ${vacancyId} not found`);
    }

    const applications = await this.prisma.vacancyApplication.findMany({
      where: { vacancyId },
      orderBy: { createdAt: "desc" },
    });

    return plainToInstance(VacancyApplicationResponseDto, applications);
  }

  async updateApplicationStatus(
    applicationId: string,
    dto: UpdateApplicationStatusDto,
  ): Promise<VacancyApplicationResponseDto> {
    const existing = await this.prisma.vacancyApplication.findUnique({
      where: { id: applicationId },
    });

    if (!existing) {
      throw new NotFoundException(
        `Application with ID ${applicationId} not found`,
      );
    }

    const application = await this.prisma.vacancyApplication.update({
      where: { id: applicationId },
      data: { status: dto.status },
    });

    return plainToInstance(VacancyApplicationResponseDto, application);
  }

  async deleteApplication(applicationId: string): Promise<void> {
    const existing = await this.prisma.vacancyApplication.findUnique({
      where: { id: applicationId },
    });

    if (!existing) {
      throw new NotFoundException(
        `Application with ID ${applicationId} not found`,
      );
    }

    await this.prisma.vacancyApplication.delete({
      where: { id: applicationId },
    });
  }
}
