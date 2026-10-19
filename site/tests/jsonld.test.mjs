import { test } from 'node:test';
import assert from 'node:assert/strict';
import { serializeJsonLd } from '../lib/jsonld.ts';

test('JSON-LD escapes <, > and & so a field cannot close the script element', () => {
  const v = { name: 'Evil </script><script>alert(1)</script> & <!-- x -->', d: 'a\u2028b\u2029c' };
  const out = serializeJsonLd(v);
  assert.doesNotMatch(out, /[<>&\u2028\u2029]/);
  assert.ok(out.includes('\\u003c/script\\u003e'));
  assert.deepEqual(JSON.parse(out), v);
});
