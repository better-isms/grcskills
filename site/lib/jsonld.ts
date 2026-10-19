// JSON for an inline <script type="application/ld+json">. Escapes <, > and &
// (and the two JS line separators) so no field, however hostile, can close the
// script element or open an HTML comment. Plain, erasable TypeScript so the
// tests can import it with Node's type stripping.
const LS = new RegExp(String.fromCharCode(0x2028), 'g');
const PS = new RegExp(String.fromCharCode(0x2029), 'g');

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(LS, '\\u2028')
    .replace(PS, '\\u2029');
}
