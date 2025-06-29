import { Expose } from "class-transformer";
import { IsBoolean, IsOptional, IsString, IsDate } from "class-validator";

export class TagOutputDto {
  @IsString()
  @Expose()
  id: string;

  @IsString()
  @Expose()
  tag: string;

  @IsBoolean()
  @Expose()
  isUserTag: boolean;

  @IsBoolean()
  @Expose()
  isOrganizationTag: boolean;

  @IsBoolean()
  @Expose()
  isEventTag: boolean;

  @IsBoolean()
  @Expose()
  isNewsTag: boolean;

  @IsBoolean()
  @Expose()
  isBlogTag: boolean;

  @IsBoolean()
  @Expose()
  isOpportunityTag: boolean;

  @IsDate()
  @Expose()
  createdAt: Date;

  @IsDate()
  @Expose()
  updatedAt: Date;

  @IsOptional()
  @IsDate()
  @Expose()
  deletedAt?: Date;
}
