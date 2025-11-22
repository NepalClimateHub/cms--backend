import { JwtService } from "@nestjs/jwt";

export const getJWTTokenForEmailVerification = (email: string) => {
    const jwtService = new JwtService();

    return jwtService.sign({email}, {
        expiresIn: "10m",
        secret:"temp-secret-key"
      });
}

