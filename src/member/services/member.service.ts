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

@Injectable()
export class MemberService {
  constructor(private readonly prisma: PrismaService) {}

  async createMember(
    createMemberDto: CreateMemberDto,
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

    return plainToInstance(MemberResponseDto, member);
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

    return plainToInstance(MemberResponseDto, member);
  }

  async deleteMember(id: string): Promise<void> {
    const existingMember = await this.prisma.nchMembers.findUnique({
      where: { id },
    });

    if (!existingMember) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    await this.prisma.nchMembers.delete({
      where: { id },
    });
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
