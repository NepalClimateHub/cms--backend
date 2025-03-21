import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class SingleOrganizationDto {
  @Expose()
  @ApiProperty({ example: "org_123456789" })
  id: string;

  @Expose()
  @ApiProperty({ example: "Tech Solutions Inc." })
  businessName: string;

  @Expose()
  @ApiProperty({ example: "contact@techsolutions.com" })
  email: string;

  @Expose()
  @ApiProperty({ example: "+1 234 567 890" })
  contact: string;

  @Expose()
  @ApiProperty({ example: "2024-01-01T12:00:00Z", nullable: true })
  dateOfJoin: Date | null;

  @Expose()
  @ApiProperty({ example: "2024-01-01T12:00:00Z" })
  createdAt: Date;

  @Expose()
  @ApiProperty({ example: "2024-02-01T12:00:00Z" })
  updatedAt: Date;

  @Expose()
  @ApiProperty({ example: null, nullable: true })
  deletedAt: Date | null;
}
