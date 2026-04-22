import { ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class AddressOutputDto {
  @Expose()
  @ApiPropertyOptional()
  street?: string | null;

  @Expose()
  @ApiPropertyOptional()
  country?: string | null;

  @Expose()
  @ApiPropertyOptional()
  city?: string | null;

  @Expose()
  @ApiPropertyOptional()
  state?: string | null;

  @Expose()
  @ApiPropertyOptional()
  postcode?: string | null;
}
