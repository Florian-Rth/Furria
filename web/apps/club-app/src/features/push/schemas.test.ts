import { describe, expect, it } from 'vitest';
import { AppPathSchema } from './schemas';

describe('AppPathSchema', () => {
  it.each<[string, string | undefined, string]>([
    ['an app path', '/beer-list', '/beer-list'],
    ['an app path with a query', '/system?tab=log', '/system?tab=log'],
    ['a protocol-relative URL', '//evil.example/x', '/'],
    ['a backslash escape', '/\\evil.example', '/'],
    ['an absolute URL', 'https://evil.example/', '/'],
    ['no path at all', undefined, '/'],
  ])('reads %s', (_case, path, expected) => {
    expect(AppPathSchema.parse(path)).toBe(expected);
  });
});
