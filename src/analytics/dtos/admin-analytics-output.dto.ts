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
}
