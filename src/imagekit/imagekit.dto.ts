import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

class ImagekitAuthParams {
  @ApiProperty({
    description: "Imagekit token",
    example: "asdasd",
  })
  @Expose()
  token: string;

  @ApiProperty({
    description: "Imagekit token expiry",
    example: 12345,
  })
  @Expose()
  expire: number;

  @ApiProperty({
    description: "Imagekit auth sinature",
    example: 12345,
  })
  @Expose()
  signature: string;
}

export class ImagekitResponseDto {
  @ApiProperty({
    description: "Imagekit auth ",
  })
  @Expose()
  ikAuthParams: ImagekitAuthParams;

  @ApiProperty({
    description: "Imagekit pub key ",
  })
  @Expose()
  publicKey: string;

  @ApiProperty({
    description: "Imagekit endpoint",
  })
  @Expose()
  endpoint: string;

  @ApiProperty({
    description: "Upload folder",
  })
  @Expose()
  folder: string;
}
