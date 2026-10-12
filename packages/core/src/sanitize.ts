import sanitize from "sanitize-html";

// 에디터(Tiptap StarterKit)가 만드는 태그만 허용한다
const options: sanitize.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "em",
    "s",
    "u",
    "code",
    "pre",
    "blockquote",
    "h1",
    "h2",
    "h3",
    "ul",
    "ol",
    "li",
    "hr",
    "a",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: sanitize.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer nofollow" }),
  },
};

/**
 * 사용자 입력 HTML 에서 허용되지 않은 태그/속성을 제거해 XSS 를 막는다.
 * @param html 사용자 입력 HTML
 * @returns 정제된 HTML
 */
export function sanitizeHtml(html: string): string {
  return sanitize(html, options);
}
