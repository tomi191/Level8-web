import sanitizeHtml from "sanitize-html";

/**
 * Sanitize blog HTML content.
 * Allows standard blog tags (headings, lists, media, tables, embeds)
 * but strips scripts, event handlers (on*), and dangerous attributes.
 */
export function sanitizeBlogHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      // Structure
      "p", "div", "span", "br", "hr",
      // Headings
      "h1", "h2", "h3", "h4", "h5", "h6",
      // Inline
      "a", "strong", "em", "b", "i", "u", "s", "mark", "small", "sub", "sup", "abbr",
      // Lists
      "ul", "ol", "li",
      // Media
      "img", "figure", "figcaption", "picture", "source", "video", "audio",
      // Embeds (YouTube, etc.)
      "iframe",
      // Code
      "pre", "code",
      // Quote
      "blockquote", "cite",
      // Table
      "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "colgroup", "col",
      // Details
      "details", "summary",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel", "title", "id"],
      img: ["src", "alt", "title", "width", "height", "loading", "decoding"],
      iframe: ["src", "width", "height", "frameborder", "allow", "allowfullscreen", "title"],
      video: ["src", "controls", "width", "height", "poster", "preload"],
      audio: ["src", "controls", "preload"],
      source: ["src", "type", "srcset", "sizes", "media"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan", "scope"],
      col: ["span"],
      colgroup: ["span"],
      blockquote: ["cite"],
      abbr: ["title"],
      // Allow id/class on all elements for styling and anchor links
      "*": ["id", "class", "style"],
    },
    allowedIframeHostnames: [
      "www.youtube.com",
      "youtube.com",
      "www.youtube-nocookie.com",
      "player.vimeo.com",
    ],
    // Strip all on* event handler attributes
    allowedStyles: {
      "*": {
        "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
        "max-width": [/.*/],
        width: [/.*/],
        height: [/.*/],
        margin: [/.*/],
        padding: [/.*/],
        "background-color": [/.*/],
        color: [/.*/],
      },
    },
  });
}
