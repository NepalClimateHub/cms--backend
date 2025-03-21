import { IsBoolean, IsOptional, IsString, IsDate } from "class-validator";

export class TagOutputDto {
  @IsString()
  id: string;

  @IsBoolean()
  isUserTag: boolean;

  @IsBoolean()
  isOrganizationTag: boolean;

  @IsBoolean()
  isEventTag: boolean;

  @IsBoolean()
  isNewsTag: boolean;

  @IsBoolean()
  isOpportunityTag: boolean;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsOptional()
  @IsDate()
  deletedAt?: Date;
}
