import { ForbiddenException, Injectable } from "@nestjs/common";
import { MediaKind, MediaStatus, Prisma, UserType } from "@prisma/client";
import { PrismaService } from "../../shared/prisma-module/prisma.service";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import { BlogMediaRef, extractBlogMedia } from "../blog-media.extractor";

export type BlogMediaPlan = {
  refs: BlogMediaRef[];
  kinds: MediaKind[];
};

type BlogMediaInput = {
  content?: string;
  bannerImageUrl?: string | null;
  bannerImageId?: string | null;
};

const STAFF_ROLES: UserType[] = [
  UserType.SUPER_ADMIN,
  UserType.ADMIN,
  UserType.CONTENT_ADMIN,
];

@Injectable()
export class BlogMediaService {
  constructor(private readonly prisma: PrismaService) {}

  plan(
    input: BlogMediaInput,
    existing?: { bannerImageUrl?: string | null; bannerImageId?: string | null },
  ): BlogMediaPlan | undefined {
    const hasContent = typeof input.content === "string";
    const hasBanner = input.bannerImageUrl !== undefined;
    if (!hasContent && !hasBanner) return undefined;

    const banner = hasBanner ? input : existing;
    const bannerId =
      input.bannerImageId !== undefined
        ? input.bannerImageId
        : existing?.bannerImageId;
    return {
      refs: extractBlogMedia(input.content ?? "", {
        url: banner?.bannerImageUrl,
        imageKitFileId: bannerId,
      }),
      kinds: hasContent ? [MediaKind.INLINE, MediaKind.BANNER] : [MediaKind.BANNER],
    };
  }

  async assertOwnership(
    ctx: RequestContext,
    plan: BlogMediaPlan | undefined,
  ): Promise<void> {
    const refs = plan?.refs ?? [];
    if (refs.length === 0) return;
    if (!ctx.user?.id) {
      throw new ForbiddenException("Missing user context");
    }
    if (STAFF_ROLES.includes(ctx.user.userType)) return;

    const foreign = await this.prisma.media.findFirst({
      where: {
        url: { in: refs.map((ref) => ref.url) },
        ownerId: { not: ctx.user.id },
      },
      select: { id: true },
    });
    if (foreign) {
      throw new ForbiddenException(
        "You cannot use media uploaded by another user.",
      );
    }
  }

  async sync(
    db: Prisma.TransactionClient,
    blogId: string,
    ownerId: string,
    plan: BlogMediaPlan | undefined,
  ): Promise<void> {
    if (!plan) return;
    await Promise.all(
      plan.refs.map((ref) => {
        const metadata = {
          kind: ref.kind,
          alt: ref.alt ?? null,
          caption: ref.caption ?? null,
          credit: ref.credit ?? null,
          blogId,
          status: MediaStatus.ACTIVE,
        };
        return db.media.upsert({
          where: { url: ref.url },
          create: {
            ...metadata,
            url: ref.url,
            ownerId,
            imageKitFileId: ref.imageKitFileId ?? null,
          },
          update: {
            ...metadata,
            ...(ref.imageKitFileId ? { imageKitFileId: ref.imageKitFileId } : {}),
          },
        });
      }),
    );
    await db.media.updateMany({
      where: {
        blogId,
        status: MediaStatus.ACTIVE,
        kind: { in: plan.kinds },
        url: { notIn: plan.refs.map((ref) => ref.url) },
      },
      data: { status: MediaStatus.ORPHANED },
    });
  }

  async orphanBlogMedia(
    db: Prisma.TransactionClient,
    blogId: string,
  ): Promise<void> {
    await db.media.updateMany({
      where: { blogId, status: MediaStatus.ACTIVE },
      data: { status: MediaStatus.ORPHANED },
    });
  }
}
