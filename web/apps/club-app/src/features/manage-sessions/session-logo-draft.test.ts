import { describe, expect, it } from 'vitest';
import type { SessionLogoEditing } from './schemas';
import type { SessionLogoDraft } from './session-logo-draft';
import { developingLogosOf, logoChangeOf, logoPreviewOf } from './session-logo-draft';

const LOGO = {
  picture: {
    smallUrl: '/api/media/1/small',
    mediumUrl: '/api/media/1/medium',
    largeUrl: '/api/media/1/large',
  },
  aspect: 1.5,
};

const STAGED: SessionLogoDraft = {
  kind: 'staged',
  file: new File([], 'logo.png', { type: 'image/png' }),
  preview: 'blob:logo',
};

const editing = (overrides: Partial<SessionLogoEditing>): SessionLogoEditing => ({
  state: 'ready',
  isStalled: false,
  logo: LOGO,
  ...overrides,
});

describe('logoChangeOf', () => {
  it.each([
    { scenario: 'an untouched logo', draft: { kind: 'kept' }, stored: true, expected: 'none' },
    { scenario: 'a newly picked logo', draft: STAGED, stored: true, expected: 'upload' },
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

describe('logoPreviewOf', () => {
  it.each([
    { scenario: 'no stored logo', stored: null, draft: { kind: 'kept' }, expected: 'none' },
    { scenario: 'a ready logo', stored: editing({}), draft: { kind: 'kept' }, expected: 'stored' },
    {
      scenario: 'a logo still developing',
      stored: editing({ state: 'processing', logo: null }),
      draft: { kind: 'kept' },
      expected: 'developing',
    },
    {
      scenario: 'a logo developing again over its former renditions',
      stored: editing({ state: 'processing' }),
      draft: { kind: 'kept' },
      expected: 'stored',
    },
    {
      scenario: 'a logo that failed to develop',
      stored: editing({ state: 'failed', logo: null }),
      draft: { kind: 'kept' },
      expected: 'failed',
    },
    { scenario: 'a picked file', stored: editing({}), draft: STAGED, expected: 'staged' },
    {
      scenario: 'a cleared logo',
      stored: editing({}),
      draft: { kind: 'cleared' },
      expected: 'none',
    },
  ] satisfies {
    scenario: string;
    stored: SessionLogoEditing | null;
    draft: SessionLogoDraft;
    expected: string;
  }[])('shows $expected for $scenario', ({ stored, draft, expected }) => {
    expect(logoPreviewOf(stored, draft).kind).toBe(expected);
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
