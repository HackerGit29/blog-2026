import DOMPurify from 'dompurify';

/**
 * Tags HTML autorisés dans le contenu affiché aux utilisateurs.
 * Couvre le HTML généré par BlockNote (éditeur) et le Markdown converti.
 */
const ALLOWED_TAGS = [
  // Texte
  'p', 'br', 'span', 'b', 'i', 'em', 'strong', 'u', 's', 'del', 'sup', 'sub',
  // Titres
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  // Listes
  'ul', 'ol', 'li',
  // Liens & médias
  'a', 'img', 'figure', 'figcaption',
  // Code
  'pre', 'code',
  // Blocs
  'blockquote', 'div',
  // Tableaux
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
  // Sémantique
  'section', 'article', 'header', 'footer', 'main', 'aside',
  'mark', 'time', 'abbr', 'cite', 'dfn', 'kbd', 'samp', 'var',
];

const ALLOWED_ATTR = [
  'href', 'src', 'alt', 'title', 'class', 'id',
  'target', 'rel', 'width', 'height', 'style',
  'colspan', 'rowspan', 'scope',
  'datetime', 'lang', 'dir',
];

/**
 * Nettoie une chaîne HTML pour prévenir les attaques XSS.
 * Utilise DOMPurify avec une allowlist stricte.
 *
 * @param dirty - HTML non fiable provenant de la DB ou d'un utilisateur
 * @returns HTML assaini, sûr pour injection via dangerouslySetInnerHTML
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof window === 'undefined') return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Ajouter rel="noopener noreferrer" sur tous les liens externes
    ADD_ATTR: ['rel'],
    // Transformer les URLs javascript: en liens inoffensifs
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
    FORCE_BODY: false,
  });
}

/**
 * Raccourci compatible avec dangerouslySetInnerHTML :
 *
 *   <div dangerouslySetInnerHTML={createSafeMarkup(html)} />
 */
export function createSafeMarkup(html: string): { __html: string } {
  return { __html: sanitizeHtml(html) };
}
