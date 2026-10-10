import { describe, expect, it } from 'vitest';
import { NewsResponseSchema } from './schemas';

describe('NewsResponseSchema', () => {
  it('reads the publication as Berlin wall-clock time and hands every section its session', () => {
    const news = NewsResponseSchema.parse({
      sessions: [
        {
          sessionStartYear: 2025,
          sessionNumber: 67,
          posts: [
            {
              slug: 'umzug',
              title: 'Umzug',
              teaser: 'Teaser',
              text: 'Text',
              category: 'session',
              publishedAt: '2026-02-16T13:11:00+00:00',
              picture: null,
            },
          ],
        },
      ],
    });

    expect([news.sessions[0]?.session, news.sessions[0]?.posts[0]?.publishedAt]).toEqual([
      { startYear: 2025, yearsLabel: '2025/26', number: 67 },
      '2026-02-16T14:11',
    ]);
  });
});
