import { describe, expect, it } from 'vitest';
import { parseFilmArgs } from './film-plan.ts';

describe('parseFilmArgs', () => {
  it('derives the name from the script and defaults the rest', () => {
    expect(parseFilmArgs(['/lab/timeline', '--script', 'films/trim-cut.json'])).toEqual({
      route: '/lab/timeline',
      scriptPath: 'films/trim-cut.json',
      name: 'trim-cut',
      baseUrl: 'http://localhost:3001',
      login: true,
      viewport: 'phone',
    });
  });

  it('takes every option', () => {
    expect(
      parseFilmArgs([
        '/lab/stage',
        '--script',
        's.json',
        '--name',
        'dots',
        '--base',
        'http://localhost:3013',
        '--no-login',
        '--viewport',
        'tablet',
      ]),
    ).toMatchObject({
      name: 'dots',
      baseUrl: 'http://localhost:3013',
      login: false,
      viewport: 'tablet',
    });
  });

  it.each([
    { name: 'no script', args: ['/lab'] },
    { name: 'a flag as the route', args: ['--script', 's.json'] },
    { name: 'a flag as a value', args: ['/lab', '--script', 's.json', '--name', '--no-login'] },
    { name: 'an unknown viewport', args: ['/lab', '--script', 's.json', '--viewport', 'watch'] },
  ])('refuses $name', ({ args }) => {
    expect(() => parseFilmArgs(args)).toThrow();
  });
});
