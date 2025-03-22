import { Injectable } from "@nestjs/common";
import { AppLogger } from "../shared/logger/logger.service";
import { RequestContext } from "../shared/request-context/request-context.dto";
import { ConfigService } from "@nestjs/config";
import ImageKit from "imagekit";
import { ImagekitResponseDto } from "./imagekit.dto";

@Injectable()
export class ImagekitService {
  private readonly imagekit: ImageKit;

  constructor(
    private configService: ConfigService,
    private readonly logger: AppLogger
  ) {
    this.imagekit = new ImageKit({
      publicKey: this.configService.get("imagekit.publicKey") as string,
      privateKey: this.configService.get("imagekit.privateKey") as string,
      urlEndpoint: this.configService.get("imagekit.urlEndpoint") as string,
    });
    this.logger.setContext(ImagekitService.name);
  }

  async getAuthParams(ctx: RequestContext): Promise<ImagekitResponseDto> {
    this.logger.log(ctx, `${this.getAuthParams.name} was called`);
    const ikAuthParams = this.imagekit.getAuthenticationParameters();
    return {
      ikAuthParams,
      publicKey: this.configService.get("imagekit.publicKey") as string,
      endpoint: this.configService.get("imagekit.urlEndpoint") as string,
      folder: this.configService.get("env") as string,
    };
  }
}
