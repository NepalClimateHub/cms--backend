import { Module } from "@nestjs/common";
import { NotificationModule } from "../notification/notification.module";
import { BlogController } from "./controllers/blog.controller";
import { BlogService } from "./services/blog.service";
import { BlogMediaService } from "./services/blog-media.service";
import { SharedModule } from "../shared/shared.module";
import { ActivityLogModule } from "../activity-log/activity-log.module";

@Module({
  imports: [SharedModule, NotificationModule, ActivityLogModule],
  controllers: [BlogController],
  providers: [BlogService, BlogMediaService],
  exports: [BlogService],
})
export class BlogModule {}
