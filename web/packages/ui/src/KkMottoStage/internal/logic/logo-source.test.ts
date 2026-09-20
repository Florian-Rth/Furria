import { describe, expect, it } from 'vitest';
import { logoSourceOf } from './logo-source';

describe('logoSourceOf', () => {
  it.each([null, '', '   ', '\n\t '])('keeps the stage bare for %j', (logoSvg) => {
    expect(logoSourceOf(logoSvg)).toBeNull();
  });

  it('turns markup into an inline data source', () => {
    expect(logoSourceOf('<svg viewBox="0 0 2 1"></svg>')).toBe(
      'data:image/svg+xml;charset=utf-8,%3Csvg%20viewBox%3D%220%200%202%201%22%3E%3C%2Fsvg%3E',
    );
  });

  it('drops the padding a database column collects', () => {
    expect(logoSourceOf('  <svg/>\n')).toBe(logoSourceOf('<svg/>'));
  });
});
