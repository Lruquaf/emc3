import sanitizeHtml from 'sanitize-html';

// ═══════════════════════════════════════════════════════════
// Sanitization Configuration
// ═══════════════════════════════════════════════════════════

const ALLOWED_TAGS = [
  // Block elements
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'div', 'blockquote', 'pre', 'code',
  'ul', 'ol', 'li',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'hr', 'br',
  // Inline elements
  'strong', 'b', 'em', 'i', 'u', 's', 'del',
  'a', 'span', 'sup', 'sub',
  // Media (limited)
  'img',
];

const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ['href', 'title', 'target', 'rel'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  code: ['class'], // For syntax highlighting
  pre: ['class'],
  span: ['class'],
  '*': ['id', 'class'],
};

// ═══════════════════════════════════════════════════════════
// Sanitize Function
// ═══════════════════════════════════════════════════════════

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeMarkdownHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      // Force external links to open in new tab with noopener
      a: (tagName, attribs) => {
        const href = attribs['href'] || '';
        const isExternal = href.startsWith('http') || href.startsWith('//');
        return {
          tagName: 'a',
          attribs: {
            ...attribs,
            ...(isExternal && {
              target: '_blank',
              rel: 'noopener noreferrer',
            }),
          },
        };
      },
    },
  });
}

/**
 * Strip all HTML tags (for plain text)
 */
export function stripHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  });
}

/**
 * Validate that markdown content doesn't contain dangerous patterns
 * This is a preliminary check before rendering
 */
export function validateMarkdownContent(markdown: string): { valid: boolean; reason?: string } {
  // Check for potentially dangerous patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick, onerror, etc.
    /data:\s*text\/html/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(markdown)) {
      return { valid: false, reason: 'Content contains potentially dangerous patterns' };
    }
  }

  return { valid: true };
}

