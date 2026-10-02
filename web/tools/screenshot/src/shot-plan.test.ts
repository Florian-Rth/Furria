import { describe, expect, it } from 'vitest';
import {
  buildShotVariants,
  deriveShotName,
  filmstripFrameFileName,
  parseShotArgs,
  pickFilmstripFrames,
} from './shot-plan.ts';

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

  it('keeps only the selected viewports and schemes', () => {
    const fileNames = buildShotVariants('start', ['desktop'], ['dark']).map(
      (variant) => variant.fileName,
    );
    expect(fileNames).toEqual(['start-desktop-dark.png']);
  });
});

describe('filmstripFrameFileName', () => {
  it.each([
    [0, 'lena-filmstrip-0000ms.png'],
    [120, 'lena-filmstrip-0120ms.png'],
    [1400, 'lena-filmstrip-1400ms.png'],
  ])('pads %i ms', (offset, expected) => {
    expect(filmstripFrameFileName('lena', offset)).toBe(expected);
  });
});

describe('pickFilmstripFrames', () => {
  it('takes the frame on screen at each offset, the earliest before the first one arrives', () => {
    const frames = [
      { at: 1100, id: 'b' },
      { at: 1000, id: 'a' },
      { at: 1250, id: 'c' },
    ];
    const picked = pickFilmstripFrames(frames, 950, [0, 100, 160, 300, 900]);
    expect(picked.map((frame) => frame?.id)).toEqual(['a', 'a', 'b', 'c', 'c']);
  });

  it('has nothing to show without frames', () => {
    expect(pickFilmstripFrames([], 0, [0, 120])).toEqual([null, null]);
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
      reducedMotion: false,
      textScale: null,
      filmstrip: false,
      viewports: ['phone', 'desktop'],
      schemes: ['light', 'dark'],
      clicks: [],
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
        '--reduced-motion',
        '--text-scale',
        '2',
        '--viewport',
        'phone',
        '--scheme',
        'dark',
        '--click',
        '[data-kk-answer-ring]',
      ]),
    ).toEqual({
      route: '/login',
      name: 'login',
      outDir: 'shots',
      baseUrl: 'http://x:1',
      login: false,
      reducedMotion: true,
      textScale: 2,
      filmstrip: false,
      viewports: ['phone'],
      schemes: ['dark'],
      clicks: ['[data-kk-answer-ring]'],
    });
  });

  it('films the phone in light unless told otherwise', () => {
    const request = parseShotArgs(['/', '--filmstrip']);
    expect([request.filmstrip, request.viewports, request.schemes]).toEqual([
      true,
      ['phone'],
      ['light'],
    ]);
  });

  it.each([
    [[]],
    [['--name']],
    [['/a', '/b']],
    [['/a', '--wat']],
    [['/a', '--text-scale', '0']],
    [['/a', '--text-scale', 'big']],
    [['/a', '--viewport', 'tablet']],
    [['/a', '--scheme', 'sepia']],
    [['/a', '--filmstrip', '--reduced-motion']],
  ])('rejects %j', (argv: string[]) => {
    expect(() => parseShotArgs(argv)).toThrow();
  });
});
