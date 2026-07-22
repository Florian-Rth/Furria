import { describe, expect, it } from 'vitest';
import { resolveApiBaseUrl } from './runtime-config';

describe('resolveApiBaseUrl', () => {
  it('prefers the runtime value when present', () => {
    expect(resolveApiBaseUrl('https://runtime.example.org', 'https://build.example.org')).toBe(
      'https://runtime.example.org',
    );
  });

  it('lets an explicit empty runtime value win to force same-origin requests', () => {
    expect(resolveApiBaseUrl('', 'https://build.example.org')).toBe('');
  });

  it('falls back to the build-time value when no runtime value exists', () => {
    expect(resolveApiBaseUrl(undefined, 'https://build.example.org')).toBe(
      'https://build.example.org',
    );
  });

  it('returns an empty string when neither value exists', () => {
    expect(resolveApiBaseUrl(undefined, undefined)).toBe('');
  });
});
