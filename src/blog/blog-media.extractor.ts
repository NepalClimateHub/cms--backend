import { BadRequestException } from "@nestjs/common";
import { MediaKind } from "@prisma/client";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { IMAGE_SRC } from "./blog-content.sanitizer";
import { BlogMediaMetadataDto } from "./dto/blog-media.dto";

export type BlogMediaRef = {
  url: string;
  kind: MediaKind;
  alt?: string;
  caption?: string;
  credit?: string;
  imageKitFileId?: string;
};

const BLOCK = /<figure(?:\s[^>]*)?>([\s\S]*?)<\/figure>|<img\s[^>]*>/g;
const IMG = /<img\s[^>]*>/g;
const ATTRIBUTE = /([a-z-]+)="([^"]*)"/g;
const FIGCAPTION = /<figcaption>([\s\S]*?)<\/figcaption>/;
const CITE = /<cite>([\s\S]*?)<\/cite>/;

function decode(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");
}

function text(fragment: string): string {
  return decode(fragment.replace(/<[^>]*>/g, "")).trim();
}

function attributes(tag: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [, name, value] of tag.matchAll(ATTRIBUTE)) {
    result[name] = decode(value);
  }
  return result;
}

function figureCaption(body: string): Pick<BlogMediaRef, "caption" | "credit"> {
  const inner = FIGCAPTION.exec(body)?.[1];
  if (inner === undefined) return {};
  const credit = CITE.exec(inner)?.[1];
  const caption = text(inner.replace(/<cite>[\s\S]*?<\/cite>/g, ""));
  return {
    caption: caption || undefined,
    credit: credit === undefined ? undefined : text(credit) || undefined,
  };
}

function inlineRefs(content: string): BlogMediaRef[] {
  const refs: BlogMediaRef[] = [];
  for (const block of content.matchAll(BLOCK)) {
    const isFigure = block[1] !== undefined;
    const caption = isFigure ? figureCaption(block[1]) : {};
    const tags = isFigure ? block[1].match(IMG) ?? [] : [block[0]];
    for (const tag of tags) {
      const { src, alt } = attributes(tag);
      if (src === undefined || !IMAGE_SRC.test(src)) continue;
      refs.push({
        url: src,
        kind: MediaKind.INLINE,
        alt: alt || undefined,
        ...caption,
      });
    }
  }
  return refs;
}

function assertValid(ref: BlogMediaRef): void {
  const errors = validateSync(plainToInstance(BlogMediaMetadataDto, ref));
  if (errors.length === 0) return;
  const messages = errors.flatMap((error) =>
    Object.values(error.constraints ?? {}),
  );
  throw new BadRequestException(`Invalid image metadata: ${messages.join("; ")}`);
}

export function extractBlogMedia(
  content: string,
  banner?: { url?: string | null; imageKitFileId?: string | null },
): BlogMediaRef[] {
  const byUrl = new Map<string, BlogMediaRef>();
  for (const ref of inlineRefs(content)) {
    if (!byUrl.has(ref.url)) byUrl.set(ref.url, ref);
  }
  if (banner?.url && IMAGE_SRC.test(banner.url)) {
    byUrl.set(banner.url, {
      ...byUrl.get(banner.url),
      url: banner.url,
      kind: MediaKind.BANNER,
      imageKitFileId: banner.imageKitFileId || undefined,
    });
  }
  const refs = [...byUrl.values()];
  refs.forEach(assertValid);
  return refs;
}
