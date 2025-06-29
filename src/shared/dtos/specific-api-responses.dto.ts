import { ApiProperty } from "@nestjs/swagger";
import { UserOutput } from "../../user/dtos/user-output.dto";
import { TagOutputDto } from "../../tags/dto/tags-output.dto";
import { EventResponseDto } from "../../events/dto/events.dto";
import { OrganizationResponseDto } from "../../organization/dto/organization.dto";
import { OpportunityResponseDto } from "../../opportunity/dto/opportunities.dto";
import { AuthTokenOutput } from "../../auth/dtos/auth-token-output.dto";
import { RegisterOutput } from "../../auth/dtos/auth-register-output.dto";
import { ImagekitResponseDto } from "../../imagekit/imagekit.dto";
import { BlogResponseDto } from "../../blog/dto/blog.dto";

// Base metadata class used by all responses
export class ResponseMetadata {
  @ApiProperty({ type: Object, required: false })
  public count?: number;

  @ApiProperty({ type: Object, required: false })
  public additionalInfo?: Record<string, any>;
}

// User responses
export class UserApiResponse {
  @ApiProperty()
  public data: UserOutput;

  @ApiProperty()
  public meta: ResponseMetadata;
}

export class UserArrayApiResponse {
  @ApiProperty({ type: [UserOutput] })
  public data: UserOutput[];

  @ApiProperty()
  public meta: ResponseMetadata;
}

// Tag responses
export class TagApiResponse {
  @ApiProperty()
  public data: TagOutputDto;

  @ApiProperty()
  public meta: ResponseMetadata;
}

export class TagArrayApiResponse {
  @ApiProperty({ type: [TagOutputDto] })
  public data: TagOutputDto[];

  @ApiProperty()
  public meta: ResponseMetadata;
}

// Event responses
export class EventApiResponse {
  @ApiProperty()
  public data: EventResponseDto;

  @ApiProperty()
  public meta: ResponseMetadata;
}

export class EventArrayApiResponse {
  @ApiProperty({ type: [EventResponseDto] })
  public data: EventResponseDto[];

  @ApiProperty()
  public meta: ResponseMetadata;
}

// Organization responses
export class OrganizationApiResponse {
  @ApiProperty()
  public data: OrganizationResponseDto;

  @ApiProperty()
  public meta: ResponseMetadata;
}

export class OrganizationArrayApiResponse {
  @ApiProperty({ type: [OrganizationResponseDto] })
  public data: OrganizationResponseDto[];

  @ApiProperty()
  public meta: ResponseMetadata;
}

// Opportunity responses
export class OpportunityApiResponse {
  @ApiProperty()
  public data: OpportunityResponseDto;

  @ApiProperty()
  public meta: ResponseMetadata;
}

export class OpportunityArrayApiResponse {
  @ApiProperty({ type: [OpportunityResponseDto] })
  public data: OpportunityResponseDto[];

  @ApiProperty()
  public meta: ResponseMetadata;
}

// Auth responses
export class AuthTokenApiResponse {
  @ApiProperty()
  public data: AuthTokenOutput;

  @ApiProperty()
  public meta: ResponseMetadata;
}

export class RegisterApiResponse {
  @ApiProperty()
  public data: RegisterOutput;

  @ApiProperty()
  public meta: ResponseMetadata;
}

// Imagekit response
export class ImagekitApiResponse {
  @ApiProperty()
  public data: ImagekitResponseDto;

  @ApiProperty()
  public meta: ResponseMetadata;
}

// Blog responses
export class BlogApiResponse {
  @ApiProperty()
  public data: BlogResponseDto;

  @ApiProperty()
  public meta: ResponseMetadata;
}

export class BlogArrayApiResponse {
  @ApiProperty({ type: [BlogResponseDto] })
  public data: BlogResponseDto[];

  @ApiProperty()
  public meta: ResponseMetadata;
}
