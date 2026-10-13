import { IsOptional, IsString, Matches, MaxLength } from "class-validator";
import { IMAGE_SRC } from "../blog-content.sanitizer";

export class BlogMediaMetadataDto {
  @IsString()
  @MaxLength(2048)
  @Matches(IMAGE_SRC, { message: "url must be an https ik.imagekit.io URL" })
  url: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  alt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  caption?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  credit?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  imageKitFileId?: string;
}
