import { BadRequestException } from "@nestjs/common";

import {
  BLOG_CONTENT_MAX_IMAGES,
  BLOG_CONTENT_MAX_LENGTH,
  sanitizeBlogContent,
} from "./blog-content.sanitizer";

const IMG = "https://ik.imagekit.io/nch/photo.jpg";

const TIPTAP_SAMPLE = [
  "<h1>Title</h1>",
  '<h2 style="text-align: center">Centered</h2>',
  "<h3>Three</h3>",
  "<h4>Four</h4>",
  '<p style="color: #ff0000; text-align: right">Para with <strong>bold</strong>, <em>italic</em>, <u>under</u>, <s>strike</s>, <b>b</b>, <i>i</i> and <code>inline</code><br>break <span style="color: rgb(10, 20, 30)">colored</span> &amp; &lt;escaped&gt;</p>',
  '<p><a href="https://example.org/a?b=1&amp;c=2" target="_blank" rel="noopener noreferrer nofollow">link</a> <a href="mailto:hi@example.org" rel="noopener noreferrer nofollow">mail</a></p>',
  "<ul><li><p>one</p></li><li><p>two</p></li></ul>",
  "<ol><li><p>first</p></li></ol>",
  "<blockquote><p>Quote</p></blockquote>",
  '<pre><code class="language-ts">const a = 1 &lt; 2;</code></pre>',
  "<hr>",
  `<figure data-layout="wide"><img src="${IMG}" alt="A photo" width="1200" height="800"><figcaption>Caption text<cite>Credit</cite></figcaption></figure>`,
  `<div data-layout="two-up"><figure><img src="${IMG}" alt="Left" width="600" height="400"><figcaption>Left</figcaption></figure><figure><img src="${IMG}" alt="Right" width="600" height="400"><figcaption>Right</figcaption></figure></div>`,
].join("");

describe("sanitizeBlogContent", () => {
  it("leaves normal Tiptap output unchanged", () => {
    expect(sanitizeBlogContent(TIPTAP_SAMPLE)).toBe(TIPTAP_SAMPLE);
  });

  it("is idempotent", () => {
    const once = sanitizeBlogContent(
      `<p onclick="x()">a</p><script>alert(1)</script>${TIPTAP_SAMPLE}`,
    );
    expect(sanitizeBlogContent(once)).toBe(once);
  });

  it.each([
    ["script element and body", "<p>a</p><script>alert(1)</script>", "<p>a</p>"],
    ["style element and body", "<style>p{color:red}</style><p>a</p>", "<p>a</p>"],
    ["event handler", '<p onclick="alert(1)">a</p>', "<p>a</p>"],
    [
      "img onerror",
      `<figure><img src="${IMG}" alt="x" onerror="alert(1)"></figure>`,
      `<figure><img src="${IMG}" alt="x"></figure>`,
    ],
    [
      "javascript href",
      '<a href="javascript:alert(1)">x</a>',
      "<a>x</a>",
    ],
    [
      "obfuscated javascript href",
      '<a href="  jav&#x09;ascript:alert(1)">x</a>',
      "<a>x</a>",
    ],
    ["data href", '<a href="data:text/html,<b>x</b>">x</a>', "<a>x</a>"],
    ["vbscript href", '<a href="vbscript:msgbox(1)">x</a>', "<a>x</a>"],
    ["relative href", '<a href="/admin">x</a>', "<a>x</a>"],
    ["protocol-relative href", '<a href="//evil.example/x">x</a>', "<a>x</a>"],
    [
      "iframe",
      '<iframe src="https://evil.example"></iframe><p>a</p>',
      "<p>a</p>",
    ],
    ["iframe srcdoc", '<iframe srcdoc="<script>1</script>">t</iframe>', "t"],
    ["object/embed", '<object data="x"></object><embed src="x"><p>a</p>', "<p>a</p>"],
    ["form", '<form action="/x"><input name="a"><button>go</button></form>', "go"],
    ["svg", '<svg onload="alert(1)"><circle/></svg><p>a</p>', "<p>a</p>"],
    [
      "style with url()",
      '<p style="background: url(https://evil.example/x.png); color: #fff">a</p>',
      '<p style="color: #fff">a</p>',
    ],
    [
      "style with expression()",
      '<p style="width: expression(alert(1))">a</p>',
      "<p>a</p>",
    ],
    [
      "style color with url",
      '<span style="color: url(javascript:alert(1))">a</span>',
      "<span>a</span>",
    ],
    ["style on disallowed tag", '<li style="color: #fff">a</li>', "<li>a</li>"],
    [
      "unapproved attributes",
      '<p class="x" id="y" data-x="1" title="t" contenteditable="true">a</p>',
      "<p>a</p>",
    ],
    [
      "unapproved img attributes",
      `<figure><img src="${IMG}" alt="x" class="c" style="width:9999px" srcset="a 1x" caption="c" data-caption="c" loading="lazy"></figure>`,
      `<figure><img src="${IMG}" alt="x"></figure>`,
    ],
    ["blob img src", '<figure><img src="blob:https://x/1" alt="x"></figure>', "<figure></figure>"],
    [
      "data img src",
      '<figure><img src="data:text/html;base64,PHNjcmlwdD4=" alt="x"></figure>',
      "<figure></figure>",
    ],
    [
      "javascript img src",
      '<figure><img src="javascript:alert(1)" alt="x"></figure>',
      "<figure></figure>",
    ],
    [
      "http img src",
      '<figure><img src="http://ik.imagekit.io/a.jpg" alt="x"></figure>',
      "<figure></figure>",
    ],
    [
      "foreign host img src",
      '<figure><img src="https://evil.example/a.jpg" alt="x"></figure>',
      "<figure></figure>",
    ],
    [
      "lookalike host img src",
      '<figure><img src="https://ik.imagekit.io.evil.example/a.jpg" alt="x"></figure>',
      "<figure></figure>",
    ],
    [
      "userinfo host img src",
      '<figure><img src="https://ik.imagekit.io@evil.example/a.jpg" alt="x"></figure>',
      "<figure></figure>",
    ],
    [
      "invalid dimensions",
      `<figure><img src="${IMG}" alt="x" width="100%" height="-5"></figure>`,
      `<figure><img src="${IMG}" alt="x"></figure>`,
    ],
    [
      "invalid layouts",
      '<figure data-layout="evil"></figure><div data-layout="wide">a</div>',
      "<figure></figure><div>a</div>",
    ],
    [
      "code class injection",
      '<pre><code class="language-x onmouseover=alert(1)">a</code></pre>',
      "<pre><code>a</code></pre>",
    ],
    [
      "target other than _blank",
      '<a href="https://example.org" target="_top">x</a>',
      '<a href="https://example.org" rel="noopener noreferrer nofollow">x</a>',
    ],
    [
      "forged rel",
      '<a href="https://example.org" target="_blank" rel="opener">x</a>',
      '<a href="https://example.org" target="_blank" rel="noopener noreferrer nofollow">x</a>',
    ],
  ])("neutralizes %s", (_name, input, expected) => {
    expect(sanitizeBlogContent(input)).toBe(expected);
  });

  it("rejects content above the size limit", () => {
    const oversize = `<p>${"a".repeat(BLOG_CONTENT_MAX_LENGTH)}</p>`;
    expect(() => sanitizeBlogContent(oversize)).toThrow(BadRequestException);
  });

  it("rejects raw payloads far above the size limit", () => {
    const oversize = "<script>x</script>".repeat(BLOG_CONTENT_MAX_LENGTH);
    expect(() => sanitizeBlogContent(oversize)).toThrow(BadRequestException);
  });

  it("accepts content exactly at the size limit", () => {
    const atLimit = "a".repeat(BLOG_CONTENT_MAX_LENGTH);
    expect(sanitizeBlogContent(atLimit)).toHaveLength(BLOG_CONTENT_MAX_LENGTH);
  });

  it("rejects alt, caption and credit above their limits", () => {
    expect(() =>
      sanitizeBlogContent(
        `<figure><img src="${IMG}" alt="${"a".repeat(301)}"></figure>`,
      ),
    ).toThrow(BadRequestException);
    expect(() =>
      sanitizeBlogContent(
        `<figure><figcaption>${"a".repeat(501)}</figcaption></figure>`,
      ),
    ).toThrow(BadRequestException);
    expect(() =>
      sanitizeBlogContent(
        `<figure><figcaption>ok<cite>${"a".repeat(201)}</cite></figcaption></figure>`,
      ),
    ).toThrow(BadRequestException);
  });

  describe("image count cap", () => {
    const figure = `<figure><img src="${IMG}" alt="a" width="10" height="10"></figure>`;

    it("accepts exactly the maximum number of images", () => {
      const html = figure.repeat(BLOG_CONTENT_MAX_IMAGES);
      expect(sanitizeBlogContent(html)).toBe(html);
    });

    it("rejects one image above the maximum", () => {
      const html = figure.repeat(BLOG_CONTENT_MAX_IMAGES + 1);
      expect(() => sanitizeBlogContent(html)).toThrow(BadRequestException);
    });

    it("counts only images that survive sanitization", () => {
      const stripped = '<img src="data:image/png;base64,AAAA" alt="x">';
      const html =
        figure.repeat(BLOG_CONTENT_MAX_IMAGES) + stripped.repeat(50);
      expect(sanitizeBlogContent(html)).toBe(
        figure.repeat(BLOG_CONTENT_MAX_IMAGES),
      );
    });

    it("rejects bare legacy images beyond the maximum", () => {
      const html = `<img src="${IMG}" alt="a">`.repeat(
        BLOG_CONTENT_MAX_IMAGES + 1,
      );
      expect(() => sanitizeBlogContent(html)).toThrow(BadRequestException);
    });
  });
});
