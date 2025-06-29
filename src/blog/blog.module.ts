import { Module } from "@nestjs/common";
import { BlogController } from "./controllers/blog.controller";
import { BlogService } from "./services/blog.service";
import { SharedModule } from "../shared/shared.module";

@Module({
  imports: [SharedModule],
  controllers: [BlogController],
  providers: [BlogService],
  exports: [BlogService],
})
export class BlogModule {}
