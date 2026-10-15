import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { timingSafeEqual } from "crypto";

@Injectable()
export class RagServiceTokenGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const configured = this.configService.get<string>("rag.serviceToken");
    const authorization = context.switchToHttp().getRequest().headers.authorization;
    const provided = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : "";

    if (!configured || !provided) {
      throw new UnauthorizedException("Invalid RAG service token");
    }

    const configuredBuffer = Buffer.from(configured);
    const providedBuffer = Buffer.from(provided);
    if (
      configuredBuffer.length !== providedBuffer.length ||
      !timingSafeEqual(configuredBuffer, providedBuffer)
    ) {
      throw new UnauthorizedException("Invalid RAG service token");
    }

    return true;
  }
}
