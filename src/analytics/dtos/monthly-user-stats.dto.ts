import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class MonthlyUserStatsDto {
  @Expose()
  @ApiProperty()
  month: string;

  @Expose()
  @ApiProperty()
  count: number;
}

export class MonthlyUserStatsResponseDto {
  @Expose()
  @ApiProperty({ type: [MonthlyUserStatsDto] })
  monthlyStats: MonthlyUserStatsDto[];

  @Expose()
  @ApiProperty()
  year: number;
}
