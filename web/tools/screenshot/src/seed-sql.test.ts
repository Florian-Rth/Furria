import { describe, expect, it } from 'vitest';
import { sqlScriptOf, sqlText } from './seed-sql.ts';

describe('sqlText', () => {
  it.each([
    ['Tanzgarde', "'Tanzgarde'"],
    ["Lena's Schlüssel", "'Lena''s Schlüssel'"],
    ["''", "''''''"],
  ])('quotes %s as %s', (value, expected) => {
    expect(sqlText(value)).toBe(expected);
  });
});

describe('sqlScriptOf', () => {
  it('runs every tweak in one transaction that stops at the first error, each echoing why', () => {
    expect(
      sqlScriptOf([
        { why: "Frank's change", statements: ['UPDATE a SET b = 1;', 'DELETE FROM c;'] },
        { why: 'empty', statements: [] },
      ]),
    ).toBe(
      [
        '\\set ON_ERROR_STOP on',
        'BEGIN;',
        "\\echo 'Frank''s change'",
        'UPDATE a SET b = 1;',
        'DELETE FROM c;',
        "\\echo 'empty'",
        'COMMIT;',
        '',
      ].join('\n'),
    );
  });
});
