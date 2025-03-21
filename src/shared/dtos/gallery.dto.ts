import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsString } from "class-validator";

export class GalleryInput {
  @ApiProperty({
    description: "Source id",
  })
  @IsString()
  sourceId?: string;

  @ApiProperty({
    description: "Public URL",
  })
  @IsString()
  publicUrl: string;
}

export class GalleryResponse {
  @Expose()
  id: string;

  @Expose()
  sourceId: string;

  @Expose()
  publicUrl: string;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;

  @Expose()
  deletedAt: string;
}
