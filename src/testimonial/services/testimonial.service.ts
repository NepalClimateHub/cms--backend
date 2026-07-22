import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma-module/prisma.service";
import { plainToInstance } from "class-transformer";
import {
  CreateTestimonialDto,
  TestimonialResponseDto,
  TestimonialSearchInput,
  UpdateTestimonialDto,
} from "../dto/testimonial.dto";
import { Prisma } from "@prisma/client";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import { ActivityLogService } from "../../activity-log/activity-log.service";
import { ActivityAction, ActivityEntity } from "@prisma/client";

@Injectable()
export class TestimonialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogService: ActivityLogService,
  ) { }

  async createTestimonial(
    createDto: CreateTestimonialDto,
    ctx?: RequestContext,
  ): Promise<TestimonialResponseDto> {
    const testimonial = await this.prisma.testimonial.create({
      data: createDto,
    });
    const _t = plainToInstance(TestimonialResponseDto, testimonial);
    if (ctx) {
      this.activityLogService.logActivity(
        ctx,
        ActivityAction.CREATE,
        ActivityEntity.TESTIMONIAL,
        _t.id,
        _t.name,
      );
    }
    return _t;
  }

  async findAllTestimonials(
    searchInput: TestimonialSearchInput,
  ): Promise<{ testimonials: TestimonialResponseDto[]; total: number }> {
    const { offset = 0, limit = 100, search } = searchInput;
    const where: Prisma.TestimonialWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [testimonials, total] = await Promise.all([
      this.prisma.testimonial.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { order: "asc" },
      }),
      this.prisma.testimonial.count({ where }),
    ]);

    return {
      testimonials: plainToInstance(
        TestimonialResponseDto,
        testimonials,
      ) as unknown as TestimonialResponseDto[],
      total,
    };
  }

  async findTestimonialById(id: string): Promise<TestimonialResponseDto> {
    const testimonial = await this.prisma.testimonial.findUnique({
      where: { id },
    });

    if (!testimonial) {
      throw new NotFoundException(`Testimonial with ID ${id} not found`);
    }

    return plainToInstance(TestimonialResponseDto, testimonial);
  }

  async updateTestimonial(
    id: string,
    updateDto: UpdateTestimonialDto,
    ctx?: RequestContext,
  ): Promise<TestimonialResponseDto> {
    const existing = await this.prisma.testimonial.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Testimonial with ID ${id} not found`);
    }

    const testimonial = await this.prisma.testimonial.update({
      where: { id },
      data: updateDto,
    });

    const _u = plainToInstance(TestimonialResponseDto, testimonial);
    if (ctx) {
      this.activityLogService.logActivity(
        ctx,
        ActivityAction.UPDATE,
        ActivityEntity.TESTIMONIAL,
        _u.id,
        _u.name,
      );
    }
    return _u;
  }

  async deleteTestimonial(id: string, ctx?: RequestContext): Promise<void> {
    const existing = await this.prisma.testimonial.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Testimonial with ID ${id} not found`);
    }

    await this.prisma.testimonial.delete({
      where: { id },
    });
    if (ctx) {
      this.activityLogService.logActivity(
        ctx,
        ActivityAction.DELETE,
        ActivityEntity.TESTIMONIAL,
        id,
        existing.name,
      );
    }
  }

  async reorderTestimonials(
    orders: { id: string; order: number }[],
  ): Promise<void> {
    await this.prisma.$transaction(
      orders.map((item) =>
        this.prisma.testimonial.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );
  }
}
