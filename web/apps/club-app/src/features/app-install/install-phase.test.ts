import { describe, expect, it } from 'vitest';
import { installPhaseOf } from './install-phase';

describe('installPhaseOf', () => {
  it.each([
    {
      label: 'a first visit shows the guide',
      input: {
        promptOutcome: 'none',
        hasInstalledNow: false,
        hasConfirmedNow: false,
        isKnownInstalled: false,
        wasConfirmed: false,
        isGuideReopened: false,
      },
      expected: 'guide',
    },
    {
      label: 'an accepted prompt waits for the install',
      input: {
        promptOutcome: 'accepted',
        hasInstalledNow: false,
        hasConfirmedNow: false,
        isKnownInstalled: false,
        wasConfirmed: false,
        isGuideReopened: false,
      },
      expected: 'installing',
    },
    {
      label: 'a dismissed prompt falls back to the guide',
      input: {
        promptOutcome: 'dismissed',
        hasInstalledNow: false,
        hasConfirmedNow: false,
        isKnownInstalled: false,
        wasConfirmed: false,
        isGuideReopened: false,
      },
      expected: 'guide',
    },
    {
      label: 'the browser reports the finished install',
      input: {
        promptOutcome: 'accepted',
        hasInstalledNow: true,
        hasConfirmedNow: false,
        isKnownInstalled: false,
        wasConfirmed: false,
        isGuideReopened: false,
      },
      expected: 'installed',
    },
    {
      label: 'the member confirms the home-screen steps',
      input: {
        promptOutcome: 'none',
        hasInstalledNow: false,
        hasConfirmedNow: true,
        isKnownInstalled: false,
        wasConfirmed: true,
        isGuideReopened: false,
      },
      expected: 'installed',
    },
    {
      label: 'the installed app is known on this phone',
      input: {
        promptOutcome: 'none',
        hasInstalledNow: false,
        hasConfirmedNow: false,
        isKnownInstalled: true,
        wasConfirmed: false,
        isGuideReopened: false,
      },
      expected: 'elsewhere',
    },
    {
      label: 'an earlier confirmation on this phone',
      input: {
        promptOutcome: 'none',
        hasInstalledNow: false,
        hasConfirmedNow: false,
        isKnownInstalled: false,
        wasConfirmed: true,
        isGuideReopened: false,
      },
      expected: 'elsewhere',
    },
    {
      label: 'the member asks for the guide again',
      input: {
        promptOutcome: 'none',
        hasInstalledNow: false,
        hasConfirmedNow: false,
        isKnownInstalled: true,
        wasConfirmed: true,
        isGuideReopened: true,
      },
      expected: 'guide',
    },
  ] as const)('$label', ({ input, expected }) => {
    expect(installPhaseOf(input)).toBe(expected);
  });
});
