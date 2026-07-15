import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { SharedModule } from "./shared/shared.module";
import { UserModule } from "./user/user.module";
import { OrganizationModule } from "./organization/organization.module";
import { TagsModule } from "./tags/tags.module";
import { ImagekitModule } from "./imagekit/imagekit.module";
import { EventsModule } from "./events/events.module";
import { NewsModule } from "./news/news.module";
import { OpportunityModule } from "./opportunity/opportunities.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { BlogModule } from "./blog/blog.module";
import { EmailSubscriptionModule } from "./email-subscription/email-subscription.module";
import { ProjectModule } from "./project/project.module";
import { ResourceModule } from "./resource/resource.module";
import { CategoryModule } from "./category/category.module";
import { AiAssistantModule } from "./ai-assistant/ai-assistant.module";
import { DatabaseModule } from "./database/database.module";
import { NotificationModule } from "./notification/notification.module";
import { MemberModule } from "./member/member.module";
import { ClimateChampionModule } from "./climate-champion/climate-champion.module";
import { ActivityLogModule } from "./activity-log/activity-log.module";
import { MinutesModule } from "./minutes/minutes.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    ScheduleModule.forRoot(),
    SharedModule,
    UserModule,
    AuthModule,
    OrganizationModule,
    TagsModule,
    ImagekitModule,
    EventsModule,
    NewsModule,
    OpportunityModule,
    AnalyticsModule,
    BlogModule,
    EmailSubscriptionModule,
    ProjectModule,
    ResourceModule,
    CategoryModule,
    AiAssistantModule,
    DatabaseModule,
    NotificationModule,
    MemberModule,
    ClimateChampionModule,
    ActivityLogModule,
    MinutesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
