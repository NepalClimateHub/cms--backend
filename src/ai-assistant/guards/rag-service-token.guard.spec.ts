import { UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ExecutionContext } from "@nestjs/common";
import { RagServiceTokenGuard } from "./rag-service-token.guard";

function context(authorization?: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers: { authorization } }),
    }),
  } as unknown as ExecutionContext;
}

describe("RagServiceTokenGuard", () => {
  const config = { get: jest.fn(() => "shared-secret") } as unknown as ConfigService;
  const guard = new RagServiceTokenGuard(config);

  it("accepts the configured bearer token", () => {
    expect(guard.canActivate(context("Bearer shared-secret"))).toBe(true);
  });

  it("rejects missing and incorrect tokens", () => {
    expect(() => guard.canActivate(context())).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(context("Bearer wrong-secret"))).toThrow(UnauthorizedException);
  });
});
