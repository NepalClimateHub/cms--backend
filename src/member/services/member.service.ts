import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma-module/prisma.service";
import {
  CreateMemberDto,
  UpdateMemberDto,
  MemberSearchInput,
  MemberResponseDto,
} from "../dto/member.dto";
import { plainToInstance } from "class-transformer";
import { Prisma } from "@prisma/client";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import { ActivityLogService } from "../../activity-log/activity-log.service";
import { ActivityAction, ActivityEntity } from "@prisma/client";

@Injectable()
export class MemberService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async createMember(
    createMemberDto: CreateMemberDto,
    ctx?: RequestContext,
  ): Promise<MemberResponseDto> {
    const member = await this.prisma.nchMembers.create({
      data: {
        ...createMemberDto,
        startDate: createMemberDto.startDate
          ? new Date(createMemberDto.startDate)
          : null,
        endDate: createMemberDto.endDate
          ? new Date(createMemberDto.endDate)
          : null,
      },
    });

    const _c = plainToInstance(MemberResponseDto, member);
    if (ctx) this.activityLogService.logActivity(ctx, ActivityAction.CREATE, ActivityEntity.MEMBER, _c.id, _c.name);
    return _c;
  }

  async findAllMembers(
    searchInput: MemberSearchInput,
  ): Promise<{ members: MemberResponseDto[]; total: number }> {
    const { offset = 0, limit = 100, search, team, status } = searchInput;

    const where: Prisma.NchMembersWhereInput = {};

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (team) {
      where.team = team;
    }

    if (status) {
      where.status = status;
    }

    const [members, total] = await Promise.all([
      this.prisma.nchMembers.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      }),
      this.prisma.nchMembers.count({ where }),
    ]);

    return {
      members: plainToInstance(
        MemberResponseDto,
        members,
      ) as unknown as MemberResponseDto[],
      total,
    };
  }

  async findMemberById(id: string): Promise<MemberResponseDto> {
    const member = await this.prisma.nchMembers.findUnique({
      where: { id },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    return plainToInstance(MemberResponseDto, member);
  }

  async updateMember(
    id: string,
    updateMemberDto: UpdateMemberDto,
    ctx?: RequestContext,
  ): Promise<MemberResponseDto> {
    const existingMember = await this.prisma.nchMembers.findUnique({
      where: { id },
    });

    if (!existingMember) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    const member = await this.prisma.nchMembers.update({
      where: { id },
      data: {
        ...updateMemberDto,
        startDate: updateMemberDto.startDate
          ? new Date(updateMemberDto.startDate)
          : null,
        endDate: updateMemberDto.endDate
          ? new Date(updateMemberDto.endDate)
          : null,
      },
    });

    const _u = plainToInstance(MemberResponseDto, member);
    if (ctx) this.activityLogService.logActivity(ctx, ActivityAction.UPDATE, ActivityEntity.MEMBER, _u.id, _u.name);
    return _u;
  }

  async deleteMember(id: string, ctx?: RequestContext): Promise<void> {
    const existingMember = await this.prisma.nchMembers.findUnique({
      where: { id },
    });

    if (!existingMember) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    await this.prisma.nchMembers.delete({
      where: { id },
    });
    if (ctx) this.activityLogService.logActivity(ctx, ActivityAction.DELETE, ActivityEntity.MEMBER, id, existingMember.name);
  }

  async reorderMembers(orders: { id: string; order: number }[]): Promise<void> {
    await this.prisma.$transaction(
      orders.map((o) =>
        this.prisma.nchMembers.update({
          where: { id: o.id },
          data: { order: o.order },
        }),
      ),
    );
  }
}
