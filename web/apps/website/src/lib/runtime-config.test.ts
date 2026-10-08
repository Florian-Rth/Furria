import { describe, expect, it } from 'vitest';
import { resolveApiBaseUrl } from './runtime-config';

describe('resolveApiBaseUrl', () => {
  it.each([
    ['https://runtime.example.org', 'https://build.example.org', 'https://runtime.example.org'],
    ['', 'https://build.example.org', ''],
    [undefined, 'https://build.example.org', 'https://build.example.org'],
    [undefined, undefined, ''],
  ])('resolves runtime %j over build time %j to %j', (runtime, buildTime, expected) => {
    expect(resolveApiBaseUrl(runtime, buildTime)).toBe(expected);
  });
});
