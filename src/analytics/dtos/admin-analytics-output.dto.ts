import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class AdminAnalyticsOutput {
  @Expose()
  @ApiProperty()
  newsCount: number;

  @Expose()
  @ApiProperty()
  userCount: string;

  @Expose()
  @ApiProperty()
  eventCount: string;

  @Expose()
  @ApiProperty()
  opportunityCount: string;

  @Expose()
  @ApiProperty()
  blogCount: string;

  @Expose()
  @ApiProperty()
  projectCount: number;

  @Expose()
  @ApiProperty()
  adminCount: number;

  @Expose()
  @ApiProperty()
  organizationCount: number;

  @Expose()
  @ApiProperty()
  individualCount: number;

  @Expose()
  @ApiProperty({
    description:
      "Organizations with a verification request submitted, awaiting admin review",
  })
  pendingOrganizationVerificationCount: number;

  @Expose()
  @ApiProperty()
  aiChatSessionsDaily: number;

  @Expose()
  @ApiProperty()
  aiChatSessionsWeekly: number;

  @Expose()
  @ApiProperty()
  aiChatSessionsMonthly: number;

  @Expose()
  @ApiProperty()
  aiChatMessagesDaily: number;

  @Expose()
  @ApiProperty()
  aiChatMessagesWeekly: number;

  @Expose()
  @ApiProperty()
  aiChatMessagesMonthly: number;
}
