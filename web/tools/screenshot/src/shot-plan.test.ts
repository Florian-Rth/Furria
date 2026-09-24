import { describe, expect, it } from 'vitest';
import { buildShotVariants, deriveShotName, parseShotArgs } from './shot-plan.ts';

describe('deriveShotName', () => {
  it.each([
    ['/', 'home'],
    ['/members', 'members'],
    ['/members/3', 'members-3'],
    ['/manage/roles?role=7', 'manage-roles-role-7'],
    ['/Groups/2/', 'groups-2'],
  ])('turns %s into %s', (route, expected) => {
    expect(deriveShotName(route)).toBe(expected);
  });
});

describe('buildShotVariants', () => {
  it('produces phone and desktop in both schemes', () => {
    const fileNames = buildShotVariants('members').map((variant) => variant.fileName);
    expect(fileNames).toEqual([
      'members-phone-light.png',
      'members-phone-dark.png',
      'members-desktop-light.png',
      'members-desktop-dark.png',
    ]);
  });
});

describe('parseShotArgs', () => {
  it('derives the name from the route and logs in by default', () => {
    expect(parseShotArgs(['/members'])).toEqual({
      route: '/members',
      name: 'members',
      outDir: 'out',
      baseUrl: 'http://localhost:3001',
      login: true,
    });
  });

  it('reads options and strips a trailing slash from the base url', () => {
    expect(
      parseShotArgs([
        '/login',
        '--no-login',
        '--name',
        'login',
        '--base',
        'http://x:1/',
        '--out',
        'shots',
      ]),
    ).toEqual({
      route: '/login',
      name: 'login',
      outDir: 'shots',
      baseUrl: 'http://x:1',
      login: false,
    });
  });

  it.each([[[]], [['--name']], [['/a', '/b']], [['/a', '--wat']]])(
    'rejects %j',
    (argv: string[]) => {
      expect(() => parseShotArgs(argv)).toThrow();
    },
  );
});
