import { BadRequestException } from "@nestjs/common";
import sanitizeHtml from "sanitize-html";

export const BLOG_CONTENT_MAX_LENGTH = 500000;

const RAW_CONTENT_MAX_LENGTH = BLOG_CONTENT_MAX_LENGTH * 2;
const ALT_MAX_LENGTH = 300;
const CAPTION_MAX_LENGTH = 500;
const CREDIT_MAX_LENGTH = 200;
export const BLOG_CONTENT_MAX_IMAGES = 100;
const LINK_REL = "noopener noreferrer nofollow";

const IMAGE_LAYOUTS = new Set(["inline", "wide", "full"]);
const TEXT_ALIGNS = new Set(["left", "center", "right", "justify"]);

const HEX_COLOR = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB_COLOR =
  /^rgba?\(\s*\d{1,3}(?:\.\d+)?%?\s*(?:,\s*\d{1,3}(?:\.\d+)?%?\s*){2}(?:,\s*\d*\.?\d+%?\s*)?\)$/i;
const HSL_COLOR =
  /^hsla?\(\s*-?\d{1,3}(?:\.\d+)?(?:deg)?\s*,\s*\d{1,3}(?:\.\d+)?%\s*,\s*\d{1,3}(?:\.\d+)?%\s*(?:,\s*\d*\.?\d+%?\s*)?\)$/i;

const LINK_HREF = /^(?:https?:|mailto:)/i;
export const IMAGE_SRC = /^https:\/\/ik\.imagekit\.io\/[^\s<>"'`\\]*$/i;
const CODE_CLASS = /^language-[a-z0-9+#-]+$/;
const POSITIVE_INTEGER = /^[1-9]\d{0,4}$/;

function isColor(value: string): boolean {
  return (
    HEX_COLOR.test(value) || RGB_COLOR.test(value) || HSL_COLOR.test(value)
  );
}

function filterStyle(style: string): string | undefined {
  const declarations: string[] = [];
  for (const part of style.split(";")) {
    const separator = part.indexOf(":");
    if (separator === -1) continue;
    const property = part.slice(0, separator).trim().toLowerCase();
    const value = part.slice(separator + 1).trim();
    if (property === "color" && isColor(value)) {
      declarations.push(`color: ${value}`);
    } else if (
      property === "text-align" &&
      TEXT_ALIGNS.has(value.toLowerCase())
    ) {
      declarations.push(`text-align: ${value.toLowerCase()}`);
    }
  }
  return declarations.length > 0 ? declarations.join("; ") : undefined;
}

function pick(
  attribs: sanitizeHtml.Attributes,
  name: string,
  accept: (value: string) => boolean,
): sanitizeHtml.Attributes {
  const value = attribs[name];
  return value !== undefined && accept(value) ? { [name]: value } : {};
}

const styledTag: sanitizeHtml.Transformer = (tagName, attribs) => {
  const result: sanitizeHtml.Attributes = {};
  const style =
    attribs.style === undefined ? undefined : filterStyle(attribs.style);
  if (style !== undefined) result.style = style;
  return { tagName, attribs: result };
};

const codeTag: sanitizeHtml.Transformer = (tagName, attribs) => ({
  tagName,
  attribs: pick(attribs, "class", (value) => CODE_CLASS.test(value)),
});

const linkTag: sanitizeHtml.Transformer = (tagName, attribs) => {
  const result: Record<string, string> = {};
  const href = attribs.href;
  if (href !== undefined && LINK_HREF.test(href.replace(/[\u0000- ]/g, ""))) {
    result.href = href;
    if (attribs.target === "_blank") result.target = "_blank";
    result.rel = LINK_REL;
  }
  return { tagName, attribs: result };
};

const figureTag: sanitizeHtml.Transformer = (tagName, attribs) => ({
  tagName,
  attribs: pick(attribs, "data-layout", (value) => IMAGE_LAYOUTS.has(value)),
});

const divTag: sanitizeHtml.Transformer = (tagName, attribs) => ({
  tagName,
  attribs: pick(attribs, "data-layout", (value) => value === "two-up"),
});

const imageTag: sanitizeHtml.Transformer = (tagName, attribs) => {
  const result: Record<string, string> = {};
  if (attribs.src !== undefined && IMAGE_SRC.test(attribs.src)) {
    result.src = attribs.src;
  }
  if (attribs.alt !== undefined) {
    if (attribs.alt.length > ALT_MAX_LENGTH) {
      throw new BadRequestException(
        `Image alt text must be at most ${ALT_MAX_LENGTH} characters`,
      );
    }
    result.alt = attribs.alt;
  }
  if (attribs.width !== undefined && POSITIVE_INTEGER.test(attribs.width)) {
    result.width = attribs.width;
  }
  if (attribs.height !== undefined && POSITIVE_INTEGER.test(attribs.height)) {
    result.height = attribs.height;
  }
  return { tagName, attribs: result };
};

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "h1",
    "h2",
    "h3",
    "h4",
    "blockquote",
    "ul",
    "ol",
    "li",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "code",
    "hr",
    "br",
    "pre",
    "a",
    "span",
    "figure",
    "figcaption",
    "cite",
    "div",
    "img",
  ],
  allowedAttributes: {
    p: ["style"],
    h1: ["style"],
    h2: ["style"],
    h3: ["style"],
    h4: ["style"],
    span: ["style"],
    code: ["class"],
    a: ["href", "target", "rel"],
    figure: ["data-layout"],
    div: ["data-layout"],
    img: ["src", "alt", "width", "height"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["https"] },
  allowProtocolRelative: false,
  parseStyleAttributes: false,
  disallowedTagsMode: "discard",
  transformTags: {
    p: styledTag,
    h1: styledTag,
    h2: styledTag,
    h3: styledTag,
    h4: styledTag,
    span: styledTag,
    code: codeTag,
    a: linkTag,
    figure: figureTag,
    div: divTag,
    img: imageTag,
  },
  exclusiveFilter: (frame) => frame.tag === "img" && !frame.attribs.src,
};

function plainTextLength(fragment: string): number {
  return fragment
    .replace(/<[^>]*>/g, "")
    .replace(/&(?:#\d+|#x[0-9a-f]+|[a-z][a-z0-9]*);/gi, "x").length;
}

function assertCaptionLimits(html: string): void {
  for (const figcaption of html.matchAll(/<figcaption>([\s\S]*?)<\/figcaption>/g)) {
    const inner = figcaption[1];
    for (const cite of inner.matchAll(/<cite>([\s\S]*?)<\/cite>/g)) {
      if (plainTextLength(cite[1]) > CREDIT_MAX_LENGTH) {
        throw new BadRequestException(
          `Image credit must be at most ${CREDIT_MAX_LENGTH} characters`,
        );
      }
    }
    const caption = inner.replace(/<cite>[\s\S]*?<\/cite>/g, "");
    if (plainTextLength(caption) > CAPTION_MAX_LENGTH) {
      throw new BadRequestException(
        `Image caption must be at most ${CAPTION_MAX_LENGTH} characters`,
      );
    }
  }
}

function assertContentLength(length: number, max: number): void {
  if (length > max) {
    throw new BadRequestException(
      `Blog content must be at most ${BLOG_CONTENT_MAX_LENGTH} characters`,
    );
  }
}

function assertImageCount(html: string): void {
  const count = html.match(/<img[\s>]/g)?.length ?? 0;
  if (count > BLOG_CONTENT_MAX_IMAGES) {
    throw new BadRequestException(
      `Blog content must have at most ${BLOG_CONTENT_MAX_IMAGES} images`,
    );
  }
}

export function sanitizeBlogContent(content: string): string {
  assertContentLength(content.length, RAW_CONTENT_MAX_LENGTH);
  const sanitized = sanitizeHtml(content, SANITIZE_OPTIONS).replace(
    / \/>/g,
    ">",
  );
  assertContentLength(sanitized.length, BLOG_CONTENT_MAX_LENGTH);
  assertCaptionLimits(sanitized);
  assertImageCount(sanitized);
  return sanitized;
}
