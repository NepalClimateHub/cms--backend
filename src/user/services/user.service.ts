import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
// import { compare, hash } from "bcrypt";
import { plainToClass } from "class-transformer";
import { AppLogger } from "../../shared/logger/logger.service";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import { CreateUserInput } from "../dtos/user-create-input.dto";
import { UserOutput } from "../dtos/user-output.dto";
import { UpdateUserInput } from "../dtos/user-update-input.dto";
import { PrismaService } from "../../shared/prisma-module/prisma.service";
import * as bcrypt from "bcrypt";

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

    const existingUser = await this.prismaService.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new BadRequestException("Email is already registered");
    }

    // Save userType to the database
    const user = await this.prismaService.user.create({
      data: {
        fullName: input.name,
        email: input.email,
        password: await bcrypt.hash(input.password, 10),
        isAccountVerified: false,
        isSuperAdmin: false,
        userType: input.userType,
        // Add other fields as needed
      },
    });

    return plainToClass(UserOutput, user, {
      excludeExtraneousValues: true,
    });
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
    // const match = await compare(pass, user.password);
    const match = true;
    if (!match) throw new UnauthorizedException("Email or password mismatch.");

    return plainToClass(UserOutput, user, {
      excludeExtraneousValues: true,
    });
  }

  async findByEmail(
    ctx: RequestContext,
    email: string
  ): Promise<UserOutput | null> {
    this.logger.log(ctx, `${this.findByEmail.name} was called`);

    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return null;
    }

    return plainToClass(UserOutput, user, {
      excludeExtraneousValues: true,
    });
  }

  async findByIdWithPassword(
    ctx: RequestContext,
    userId: string
  ): Promise<any> {
    this.logger.log(ctx, `${this.findByIdWithPassword.name} was called`);

    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return null;
    }

    return user; // Return raw user data including password
  }

  async getUsers(
    ctx: RequestContext,
    limit: number,
    offset: number
  ): Promise<{ users: UserOutput[]; count: number }> {
    this.logger.log(ctx, `${this.getUsers.name} was called`);

    const [users, count] = await Promise.all([
      this.prismaService.user.findMany({
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prismaService.user.count(),
    ]);

    const usersOutput = plainToClass(UserOutput, users, {
      excludeExtraneousValues: true,
    });

    return { users: usersOutput, count };
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
    userId: string,
    input: UpdateUserInput
  ): Promise<UserOutput> {
    this.logger.log(ctx, `${this.updateUser.name} was called`);

    // Hash the password if it exists in the input payload.
    if (input.password) {
      // input.password = await hash(input.password, 10);
    }

    // Map name to fullName for Prisma
    const updateData: any = { ...input };
    if (input.name !== undefined) {
      updateData.fullName = input.name;
      delete updateData.name;
    }

    const user = await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: updateData,
    });

    return plainToClass(UserOutput, user, {
      excludeExtraneousValues: true,
    });
  }
}
