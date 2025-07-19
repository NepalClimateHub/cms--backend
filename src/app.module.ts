import { Module } from "@nestjs/common";

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

@Module({
  imports: [
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
