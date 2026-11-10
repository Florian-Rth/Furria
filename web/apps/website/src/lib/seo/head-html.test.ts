import { describe, expect, it } from 'vitest';
import { renderHeadHtml } from './head-html';

describe('renderHeadHtml', () => {
  it('renders title, meta, link and JSON-LD as marked head tags with escaped values', () => {
    expect(
      renderHeadHtml({
        meta: [
          { title: 'Tanz & "Gaudi" <live>' },
          { property: 'og:title', content: 'A & B' },
          undefined,
        ],
        links: [{ rel: 'canonical', href: 'https://example.test/a?b=1&c=2' }],
        scripts: [{ type: 'application/ld+json', children: '{"name":"</script>"}' }],
      }),
    ).toBe(
      [
        '<title data-page-head>Tanz &amp; &quot;Gaudi&quot; &lt;live&gt;</title>',
        '<meta data-page-head property="og:title" content="A &amp; B">',
        '<link data-page-head rel="canonical" href="https://example.test/a?b=1&amp;c=2">',
        '<script data-page-head type="application/ld+json">{"name":"\\u003c/script>"}</script>',
      ].join('\n    '),
    );
  });
});
