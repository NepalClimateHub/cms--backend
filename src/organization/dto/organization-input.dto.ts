import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class OrganizationSearchInput {
  @ApiProperty()
  @IsOptional()
  @IsString()
  businessName: string;
}
