import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma-module/prisma.service';
import { CreateMinutesDto, UpdateMinutesDto, MinutesSearchInput, MinutesResponseDto } from '../dto/minutes.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class MinutesService {
  constructor(private readonly prisma: PrismaService) {}

  async createMinutes(dto: CreateMinutesDto): Promise<MinutesResponseDto> {
    const minutes = await (this.prisma as any).minutes.create({
      data: {
        title: dto.title,
        date: dto.date ? new Date(dto.date) : null,
        meetingTime: dto.meetingTime || null,
        agenda: dto.agenda,
        meetingSummary: dto.meetingSummary,
      },
    });

    return plainToInstance(MinutesResponseDto, minutes, { excludeExtraneousValues: true });
  }

  async findAllMinutes(searchInput: MinutesSearchInput): Promise<{ minutes: MinutesResponseDto[]; total: number }> {
    const { offset = 0, limit = 10, title } = searchInput;
    const where: any = { deletedAt: null };

    if (title) {
      where.title = { contains: title, mode: 'insensitive' };
    }

    const [minutes, total] = await Promise.all([
      (this.prisma as any).minutes.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      (this.prisma as any).minutes.count({ where }),
    ]);

    return {
      minutes: plainToInstance(MinutesResponseDto, minutes, { excludeExtraneousValues: true }) as unknown as MinutesResponseDto[],
      total,
    };
  }

  async findMinutesById(id: string): Promise<MinutesResponseDto> {
    const minutes = await (this.prisma as any).minutes.findFirst({
      where: { id, deletedAt: null },
    });

    if (!minutes) {
      throw new NotFoundException(`Minutes with ID ${id} not found`);
    }

    return plainToInstance(MinutesResponseDto, minutes, { excludeExtraneousValues: true });
  }

  async updateMinutes(id: string, dto: UpdateMinutesDto): Promise<MinutesResponseDto> {
    await this.findMinutesById(id);

    const updateData: any = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.date !== undefined) updateData.date = dto.date ? new Date(dto.date) : null;
    if (dto.meetingTime !== undefined) updateData.meetingTime = dto.meetingTime;
    if (dto.agenda !== undefined) updateData.agenda = dto.agenda;
    if (dto.meetingSummary !== undefined) updateData.meetingSummary = dto.meetingSummary;

    const minutes = await (this.prisma as any).minutes.update({
      where: { id },
      data: updateData,
    });

    return plainToInstance(MinutesResponseDto, minutes, { excludeExtraneousValues: true });
  }

  async deleteMinutes(id: string): Promise<void> {
    await this.findMinutesById(id);
    await (this.prisma as any).minutes.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
