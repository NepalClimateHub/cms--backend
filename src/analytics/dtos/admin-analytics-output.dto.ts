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
  aiChatSessionsToday: number;

  @Expose()
  @ApiProperty()
  aiChatSessionsYesterday: number;

  @Expose()
  @ApiProperty()
  aiChatSessionsThisMonth: number;

  @Expose()
  @ApiProperty()
  aiChatSessionsAllTime: number;

  @Expose()
  @ApiProperty()
  aiChatMessagesToday: number;

  @Expose()
  @ApiProperty()
  aiChatMessagesYesterday: number;

  @Expose()
  @ApiProperty()
  aiChatMessagesThisMonth: number;

  @Expose()
  @ApiProperty()
  aiChatMessagesAllTime: number;
}
