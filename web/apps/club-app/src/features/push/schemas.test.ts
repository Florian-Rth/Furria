import { describe, expect, it } from 'vitest';
import { AppPathSchema } from './schemas';

describe('AppPathSchema', () => {
  it.each<[string, string | undefined, string]>([
    ['an app path with a query', '/system?tab=log', '/system?tab=log'],
    ['a protocol-relative URL', '//evil.example/x', '/'],
    ['a tab that collapses into a protocol-relative URL', '/\t/evil.example', '/'],
    ['an absolute URL', 'https://evil.example/', '/'],
  ])('reads %s', (_case, path, expected) => {
    expect(AppPathSchema.parse(path)).toBe(expected);
  });
});
