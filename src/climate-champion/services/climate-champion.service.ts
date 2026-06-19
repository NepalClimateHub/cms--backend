import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma-module/prisma.service";
import { plainToInstance } from "class-transformer";
import {
  CreateClimateChampionDto,
  ClimateChampionResponseDto,
  ClimateChampionSearchInput,
  UpdateClimateChampionDto,
} from "../dto/climate-champion.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class ClimateChampionService {
  constructor(private readonly prisma: PrismaService) {}

  async createClimateChampion(
    createDto: CreateClimateChampionDto,
  ): Promise<ClimateChampionResponseDto> {
    const champion = await this.prisma.climateChampion.create({
      data: createDto,
    });
    return plainToInstance(ClimateChampionResponseDto, champion);
  }

  async findAllClimateChampions(
    searchInput: ClimateChampionSearchInput,
  ): Promise<{ champions: ClimateChampionResponseDto[]; total: number }> {
    const { offset = 0, limit = 100, search } = searchInput;
    const where: Prisma.ClimateChampionWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    const [champions, total] = await Promise.all([
      this.prisma.climateChampion.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { order: "asc" },
      }),
      this.prisma.climateChampion.count({ where }),
    ]);

    return {
      champions: plainToInstance(
        ClimateChampionResponseDto,
        champions,
      ) as unknown as ClimateChampionResponseDto[],
      total,
    };
  }

  async findClimateChampionById(id: string): Promise<ClimateChampionResponseDto> {
    const champion = await this.prisma.climateChampion.findUnique({
      where: { id },
    });

    if (!champion) {
      throw new NotFoundException(`Climate Champion with ID ${id} not found`);
    }

    return plainToInstance(ClimateChampionResponseDto, champion);
  }

  async updateClimateChampion(
    id: string,
    updateDto: UpdateClimateChampionDto,
  ): Promise<ClimateChampionResponseDto> {
    const existing = await this.prisma.climateChampion.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Climate Champion with ID ${id} not found`);
    }

    const champion = await this.prisma.climateChampion.update({
      where: { id },
      data: updateDto,
    });

    return plainToInstance(ClimateChampionResponseDto, champion);
  }

  async deleteClimateChampion(id: string): Promise<void> {
    const existing = await this.prisma.climateChampion.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Climate Champion with ID ${id} not found`);
    }

    await this.prisma.climateChampion.delete({
      where: { id },
    });
  }

  async reorderClimateChampions(
    orders: { id: string; order: number }[],
  ): Promise<void> {
    await this.prisma.$transaction(
      orders.map((item) =>
        this.prisma.climateChampion.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );
  }
}
