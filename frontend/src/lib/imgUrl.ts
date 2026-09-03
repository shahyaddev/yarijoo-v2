/**
 * Normalise an image path coming from the API.
 *
 * The DB stores paths as  /uploads/blog/xxx.jpg  (already with leading slash).
 * This helper ensures:
 *   - null / empty  → null
 *   - already http  → returned as-is
 *   - /uploads/...  → returned as-is  (Next.js serves public/ folder at /)
 *   - uploads/...   → /uploads/...    (add leading slash)
 *   - anything else → /anything-else
 */
export function imgUrl(path: string | null | undefined): string | null {
  if (!path || path.trim() === '') return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  // Already has leading slash — return as-is (avoids double //)
  if (path.startsWith('/')) return path
  // No leading slash — add one
  return `/${path}`
}
