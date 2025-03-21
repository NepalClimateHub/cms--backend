import { Injectable, UnauthorizedException } from "@nestjs/common";
import { compare, hash } from "bcrypt";
import { plainToClass } from "class-transformer";

import { AppLogger } from "../../shared/logger/logger.service";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import { CreateUserInput } from "../dtos/user-create-input.dto";
import { UserOutput } from "../dtos/user-output.dto";
import { UpdateUserInput } from "../dtos/user-update-input.dto";
import { PrismaService } from "../../shared/prisma-module/prisma.service";

@Injectable()
export class UserService {
  constructor(
    private readonly logger: AppLogger,
    private readonly prismaService: PrismaService
  ) {
    this.logger.setContext(UserService.name);
  }
  async createUser(
    ctx: RequestContext,
    input: CreateUserInput
  ): Promise<UserOutput> {
    this.logger.log(ctx, `${this.createUser.name} was called`);

    return plainToClass(
      UserOutput,
      {},
      {
        excludeExtraneousValues: true,
      }
    );
  }

  async validateUsernamePassword(
    ctx: RequestContext,
    email: string,
    pass: string
  ): Promise<UserOutput> {
    this.logger.log(ctx, `${this.validateUsernamePassword.name} was called`);

    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) throw new UnauthorizedException("User not found.");
    const match = await compare(pass, user.password);
    if (!match) throw new UnauthorizedException("Email or password mismatch.");

    return plainToClass(UserOutput, user, {
      excludeExtraneousValues: true,
    });
  }

  async getUsers(
    ctx: RequestContext,
    limit: number,
    offset: number
  ): Promise<{ users: UserOutput[]; count: number }> {
    this.logger.log(ctx, `${this.getUsers.name} was called`);

    const usersOutput = plainToClass(UserOutput, [], {
      excludeExtraneousValues: true,
    });

    return { users: usersOutput, count: 1 };
  }

  async findById(ctx: RequestContext, id: string): Promise<UserOutput> {
    this.logger.log(ctx, `${this.findById.name} was called`);

    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) throw new UnauthorizedException("User not found.");

    return plainToClass(UserOutput, user, {
      excludeExtraneousValues: true,
    });
  }

  async getUserById(ctx: RequestContext, id: number): Promise<UserOutput> {
    this.logger.log(ctx, `${this.getUserById.name} was called`);

    return plainToClass(
      UserOutput,
      {},
      {
        excludeExtraneousValues: true,
      }
    );
  }

  async findByUsername(
    ctx: RequestContext,
    username: string
  ): Promise<UserOutput> {
    this.logger.log(ctx, `${this.findByUsername.name} was called`);

    return plainToClass(
      UserOutput,
      {},
      {
        excludeExtraneousValues: true,
      }
    );
  }

  async updateUser(
    ctx: RequestContext,
    userId: number,
    input: UpdateUserInput
  ): Promise<UserOutput> {
    this.logger.log(ctx, `${this.updateUser.name} was called`);

    // Hash the password if it exists in the input payload.
    if (input.password) {
      input.password = await hash(input.password, 10);
    }

    return plainToClass(
      UserOutput,
      {},
      {
        excludeExtraneousValues: true,
      }
    );
  }
}
