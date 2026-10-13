import { BadRequestException } from "@nestjs/common";
import { MediaKind } from "@prisma/client";
import { extractBlogMedia } from "./blog-media.extractor";

const A = "https://ik.imagekit.io/nch/a.jpg?tr=w-300&v=1";
const B = "https://ik.imagekit.io/nch/b.jpg";

function figure(src: string, alt: string, caption = "", credit = ""): string {
  const cite = credit ? `<cite>${credit}</cite>` : "";
  const figcaption = caption || cite ? `<figcaption>${caption}${cite}</figcaption>` : "";
  return `<figure data-layout="wide"><img src="${src}" alt="${alt}" width="10" height="10">${figcaption}</figure>`;
}

describe("extractBlogMedia", () => {
  it("extracts url, alt, caption and credit per figure", () => {
    const content = `<p>x</p>${figure("https://ik.imagekit.io/nch/a.jpg?tr=w-300&amp;v=1", "A &amp; &quot;B&quot;", "Cap <em>tion</em>", "Photo Credit")}`;

    expect(extractBlogMedia(content)).toEqual([
      {
        url: A,
        kind: MediaKind.INLINE,
        alt: 'A & "B"',
        caption: "Cap tion",
        credit: "Photo Credit",
      },
    ]);
  });

  it("handles two-up layouts, bare legacy images and duplicates", () => {
    const content = [
      `<div data-layout="two-up">${figure(A, "L", "Left")}${figure(B, "R", "Right")}</div>`,
      `<img src="${B}" alt="again">`,
      `<img src="https://ik.imagekit.io/nch/c.jpg">`,
    ].join("");

    const refs = extractBlogMedia(content);

    expect(refs.map((ref) => ref.url)).toEqual([
      A,
      B,
      "https://ik.imagekit.io/nch/c.jpg",
    ]);
    expect(refs[1]).toMatchObject({ alt: "R", caption: "Right" });
    expect(refs[2].alt).toBeUndefined();
  });

  it("tracks an ImageKit banner with its file id and ignores external banners", () => {
    const refs = extractBlogMedia(figure(B, "b"), {
      url: B,
      imageKitFileId: "file_1",
    });

    expect(refs).toEqual([
      expect.objectContaining({
        url: B,
        kind: MediaKind.BANNER,
        alt: "b",
        imageKitFileId: "file_1",
      }),
    ]);
    expect(
      extractBlogMedia("", { url: "https://example.com/banner.jpg" }),
    ).toEqual([]);
  });

  it.each([
    ["alt", figure(B, "a".repeat(301))],
    ["caption", figure(B, "a", "c".repeat(501))],
    ["credit", figure(B, "a", "", "c".repeat(201))],
  ])("rejects %s above the contract limit", (_name, content) => {
    expect(() => extractBlogMedia(content)).toThrow(BadRequestException);
  });

  it("accepts metadata exactly at the limits", () => {
    expect(() =>
      extractBlogMedia(figure(B, "a".repeat(300), "c".repeat(500), "d".repeat(200))),
    ).not.toThrow();
  });

  it("rejects an oversize ImageKit file id", () => {
    expect(() =>
      extractBlogMedia("", { url: B, imageKitFileId: "f".repeat(129) }),
    ).toThrow(BadRequestException);
  });
});
