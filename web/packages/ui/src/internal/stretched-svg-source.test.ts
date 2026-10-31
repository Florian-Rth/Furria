import { describe, expect, it } from 'vitest';
import { stretchedSvgSourceOf } from './stretched-svg-source';

const PREFIX = 'data:image/svg+xml;charset=utf-8,';

const markupOf = (source: string | null): string | null =>
  source === null ? null : decodeURIComponent(source.slice(PREFIX.length));

describe('stretchedSvgSourceOf', () => {
  it.each([
    {
      markup: '<svg viewBox="0 0 4 3"><rect/></svg>',
      expected: '<svg preserveAspectRatio="none" viewBox="0 0 4 3"><rect/></svg>',
    },
    {
      markup: '<svg viewBox="0 0 4 3" preserveAspectRatio="xMidYMid meet"></svg>',
      expected: '<svg preserveAspectRatio="none" viewBox="0 0 4 3"></svg>',
    },
    {
      markup: '  <?xml version="1.0"?><svg width="40" height="30"><g/></svg>\n',
      expected:
        '<?xml version="1.0"?><svg preserveAspectRatio="none" viewBox="0 0 40 30" width="40" height="30"><g/></svg>',
    },
    {
      markup: '<svg><g/></svg>',
      expected: '<svg preserveAspectRatio="none"><g/></svg>',
    },
  ])('stretches $markup', ({ markup, expected }) => {
    expect(markupOf(stretchedSvgSourceOf(markup))).toBe(expected);
  });

  it.each([null, '', '  \n ', '<html></html>'])('has no source for %j', (markup) => {
    expect(stretchedSvgSourceOf(markup)).toBeNull();
  });
});
