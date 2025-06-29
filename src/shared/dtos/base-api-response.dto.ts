import { Type } from "@nestjs/common";
import {
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
} from "@nestjs/swagger";
import { TagOutputDto } from "../../tags/dto/tags-output.dto";
import { UserOutput } from "../../user/dtos/user-output.dto";
import { EventResponseDto } from "../../events/dto/events.dto";
import { OrganizationResponseDto } from "../../organization/dto/organization.dto";
import { OpportunityResponseDto } from "../../opportunity/dto/opportunities.dto";
import { AuthTokenOutput } from "../../auth/dtos/auth-token-output.dto";
import { RegisterOutput } from "../../auth/dtos/auth-register-output.dto";
import { ImagekitResponseDto } from "../../imagekit/imagekit.dto";
import { BlogResponseDto } from "../../blog/dto/blog.dto";
import {
  UserApiResponse,
  UserArrayApiResponse,
  TagApiResponse,
  TagArrayApiResponse,
  EventApiResponse,
  EventArrayApiResponse,
  OrganizationApiResponse,
  OrganizationArrayApiResponse,
  OpportunityApiResponse,
  OpportunityArrayApiResponse,
  AuthTokenApiResponse,
  RegisterApiResponse,
  ImagekitApiResponse,
  BlogApiResponse,
  BlogArrayApiResponse,
} from "./specific-api-responses.dto";

// Keeping this for backward compatibility
export class BaseApiResponse<T> {
  public data: T;

  @ApiProperty({ type: Object })
  public meta: Record<string, any> = {};
}

// API property type definition
type ApiPropertyType =
  | Type<unknown>
  | Function
  | [Function]
  | string
  | number
  | boolean;

// Type mapping dictionary - maps type names to response classes
interface TypeMapping {
  [key: string]: any;
}

// Non-generic response type mapping
const responseTypeMap: TypeMapping = {
  UserOutput: UserApiResponse,
  "UserOutput[]": UserArrayApiResponse,
  TagOutputDto: TagApiResponse,
  "TagOutputDto[]": TagArrayApiResponse,
  EventResponseDto: EventApiResponse,
  "EventResponseDto[]": EventArrayApiResponse,
  OrganizationResponseDto: OrganizationApiResponse,
  "OrganizationResponseDto[]": OrganizationArrayApiResponse,
  OpportunityResponseDto: OpportunityApiResponse,
  "OpportunityResponseDto[]": OpportunityArrayApiResponse,
  AuthTokenOutput: AuthTokenApiResponse,
  RegisterOutput: RegisterApiResponse,
  ImagekitResponseDto: ImagekitApiResponse,
  BlogResponseDto: BlogApiResponse,
  "BlogResponseDto[]": BlogArrayApiResponse,
};

/**
 * Returns a proper OpenAPI compatible response class
 * This function avoids using generics in OpenAPI schema generation
 */
export function SwaggerBaseApiResponse<T extends ApiPropertyType>(
  type: T
): any {
  let typeName: string;
  if (Array.isArray(type)) {
    typeName = `${type[0].name}[]`;
  } else if (typeof type === "function") {
    typeName = (type as Function).name;
  } else {
    typeName = String(type);
  }

  if (responseTypeMap[typeName]) {
    return responseTypeMap[typeName];
  }

  const className = `ApiResponseOf${typeName.replace("[]", "Array")}`;

  class CustomApiResponse extends BaseApiResponse<any> {
    @ApiProperty(
      Array.isArray(type)
        ? {
            type: "array",
            items: {
              $ref: getSchemaPath(type[0]),
            },
          }
        : { type: type as any }
    )
    public declare data: any;
  }

  Object.defineProperty(CustomApiResponse, "name", {
    value: className,
  });

  return CustomApiResponse;
}

export class BaseApiErrorObject {
  @ApiProperty({ type: Number })
  public statusCode: number;

  @ApiProperty({ type: String })
  public message: string;

  @ApiPropertyOptional({ type: String })
  public localizedMessage: string;

  @ApiProperty({ type: String })
  public errorName: string;

  @ApiProperty({ type: Object })
  public details: unknown;

  @ApiProperty({ type: String })
  public path: string;

  @ApiProperty({ type: String })
  public requestId: string;

  @ApiProperty({ type: String })
  public timestamp: string;
}

export class BaseApiErrorResponse {
  @ApiProperty({ type: BaseApiErrorObject })
  public error: BaseApiErrorObject;
}
