import { describe, expect, it } from 'vitest';
import type { SessionLogoEditing } from './schemas';
import type { SessionLogoDesk, SessionLogoDraft } from './session-logo-draft';
import {
  cancelLogoCut,
  developingLogosOf,
  finishLogoCut,
  logoChangeOf,
  stageLogo,
  startLogoCut,
  toSessionLogoBanner,
  wholeLogoAspectOf,
} from './session-logo-draft';

const LOGO = {
  picture: {
    smallUrl: '/api/media/1/small',
    mediumUrl: '/api/media/1/medium',
    largeUrl: '/api/media/1/large',
  },
  aspect: 1.5,
};

const FILE = new File([], 'logo.png', { type: 'image/png' });

const STAGED: SessionLogoDraft = {
  kind: 'staged',
  file: FILE,
  source: 'blob:logo',
  aspect: 2,
  crop: { left: 0, top: 0, width: 1, height: 1 },
};

const editing = (overrides: Partial<SessionLogoEditing>): SessionLogoEditing => ({
  state: 'ready',
  isStalled: false,
  logo: LOGO,
  uncroppedUrl: '/api/media/1/uncropped',
  crop: null,
  ...overrides,
});

describe('logoChangeOf', () => {
  it.each([
    { scenario: 'an untouched logo', draft: { kind: 'kept' }, stored: true, expected: 'none' },
    { scenario: 'a newly picked logo', draft: STAGED, stored: true, expected: 'upload' },
    {
      scenario: 'a stored logo cut anew',
      draft: { kind: 'recut', crop: { left: 0.1, top: 0.1, width: 0.5, height: 0.5 } },
      stored: true,
      expected: 'recut',
    },
    { scenario: 'a cleared logo', draft: { kind: 'cleared' }, stored: true, expected: 'remove' },
    {
      scenario: 'a cleared draft without a stored logo',
      draft: { kind: 'cleared' },
      stored: false,
      expected: 'none',
    },
  ] satisfies { scenario: string; draft: SessionLogoDraft; stored: boolean; expected: string }[])(
    'sends $expected for $scenario',
    ({ draft, stored, expected }) => {
      expect(logoChangeOf(draft, stored)).toBe(expected);
    },
  );
});

describe('wholeLogoAspectOf', () => {
  it.each([
    { scenario: 'no stored logo', stored: null, expected: 1 },
    { scenario: 'a logo without a cut', stored: editing({}), expected: 1.5 },
    {
      scenario: 'a logo cut to a wider shape',
      stored: editing({ crop: { left: 0, top: 0.25, width: 1, height: 0.5 } }),
      expected: 0.75,
    },
  ] satisfies { scenario: string; stored: SessionLogoEditing | null; expected: number }[])(
    'reads $expected for $scenario',
    ({ stored, expected }) => {
      expect(wholeLogoAspectOf(stored)).toBeCloseTo(expected);
    },
  );
});

describe('stageLogo', () => {
  it.each([
    { scenario: 'a readable picture', aspect: 2, expected: { aspect: 2, isCutting: true } },
    {
      scenario: 'an unreadable picture',
      aspect: null,
      expected: { aspect: null, isCutting: false },
    },
  ] satisfies {
    scenario: string;
    aspect: number | null;
    expected: { aspect: number | null; isCutting: boolean };
  }[])('opens the cut only for $scenario', ({ aspect, expected }) => {
    const desk = stageLogo({ file: FILE, source: 'blob:logo', aspect });

    expect({
      aspect: desk.draft.kind === 'staged' ? desk.draft.aspect : undefined,
      isCutting: desk.cut !== null,
    }).toEqual(expected);
  });
});

describe('logo cut', () => {
  const CUT = { left: 0.2, top: 0.2, width: 0.6, height: 0.6 };

  it('keeps the chosen cut on a picked logo', () => {
    const desk: SessionLogoDesk = { draft: { ...STAGED, crop: null }, cut: { crop: CUT } };

    expect(finishLogoCut(desk)).toEqual({ draft: { ...STAGED, crop: CUT }, cut: null });
  });

  it('turns a stored logo into a recut', () => {
    const desk: SessionLogoDesk = { draft: { kind: 'kept' }, cut: { crop: CUT } };

    expect(finishLogoCut(desk)).toEqual({ draft: { kind: 'recut', crop: CUT }, cut: null });
  });

  it('drops a fresh pick when its first cut is cancelled', () => {
    const desk: SessionLogoDesk = { draft: { ...STAGED, crop: null }, cut: { crop: CUT } };

    expect(cancelLogoCut(desk)).toEqual({ draft: { kind: 'kept' }, cut: null });
  });

  it.each([
    { scenario: 'a stored logo with its whole picture', stored: editing({}), expected: true },
    {
      scenario: 'a stored logo without its whole picture',
      stored: editing({ uncroppedUrl: null }),
      expected: false,
    },
    { scenario: 'no stored logo', stored: null, expected: false },
  ] satisfies { scenario: string; stored: SessionLogoEditing | null; expected: boolean }[])(
    'opens the cut for $scenario: $expected',
    ({ stored, expected }) => {
      expect(startLogoCut({ draft: { kind: 'kept' }, cut: null }, stored).cut !== null).toBe(
        expected,
      );
    },
  );
});

describe('toSessionLogoBanner', () => {
  it.each([
    { scenario: 'no stored logo', stored: null, desk: { kind: 'kept' }, expected: 'empty' },
    { scenario: 'a ready logo', stored: editing({}), desk: { kind: 'kept' }, expected: 'ready' },
    {
      scenario: 'a logo still developing',
      stored: editing({ state: 'processing', logo: null }),
      desk: { kind: 'kept' },
      expected: 'developing',
    },
    {
      scenario: 'a logo stalled while developing',
      stored: editing({ state: 'processing', isStalled: true, logo: null }),
      desk: { kind: 'kept' },
      expected: 'stalled',
    },
    {
      scenario: 'a logo that failed to develop',
      stored: editing({ state: 'failed', logo: null }),
      desk: { kind: 'kept' },
      expected: 'failed',
    },
    { scenario: 'a picked file', stored: editing({}), desk: STAGED, expected: 'ready' },
    {
      scenario: 'a cleared logo',
      stored: editing({}),
      desk: { kind: 'cleared' },
      expected: 'empty',
    },
  ] satisfies {
    scenario: string;
    stored: SessionLogoEditing | null;
    desk: SessionLogoDraft;
    expected: string;
  }[])('shows $expected for $scenario', ({ stored, desk, expected }) => {
    expect(toSessionLogoBanner(stored, { draft: desk, cut: null }).state).toBe(expected);
  });

  it('previews a recut stored logo from its whole picture', () => {
    const crop = { left: 0.1, top: 0.1, width: 0.8, height: 0.8 };

    expect(
      toSessionLogoBanner(editing({}), { draft: { kind: 'recut', crop }, cut: null }),
    ).toMatchObject({
      state: 'ready',
      source: null,
      preview: { source: '/api/media/1/uncropped', crop },
      note: 'recut',
    });
  });
});

describe('developingLogosOf', () => {
  it.each([
    { scenario: 'no logos', logos: [], expected: { isDeveloping: false, isStalled: false } },
    {
      scenario: 'only ready logos',
      logos: [editing({}), null],
      expected: { isDeveloping: false, isStalled: false },
    },
    {
      scenario: 'one logo developing',
      logos: [editing({}), editing({ state: 'processing', logo: null })],
      expected: { isDeveloping: true, isStalled: false },
    },
    {
      scenario: 'only stalled logos developing',
      logos: [editing({ state: 'processing', isStalled: true, logo: null })],
      expected: { isDeveloping: true, isStalled: true },
    },
    {
      scenario: 'a stalled and a moving logo',
      logos: [
        editing({ state: 'processing', isStalled: true, logo: null }),
        editing({ state: 'processing', logo: null }),
      ],
      expected: { isDeveloping: true, isStalled: false },
    },
  ] satisfies {
    scenario: string;
    logos: (SessionLogoEditing | null)[];
    expected: { isDeveloping: boolean; isStalled: boolean };
  }[])('reads $scenario', ({ logos, expected }) => {
    expect(developingLogosOf(logos)).toEqual(expected);
  });
});
