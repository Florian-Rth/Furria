import { describe, expect, it } from 'vitest';
import { isInstallGateClosed } from './install-gate';

const PHONE_TAB = {
  device: 'phone',
  isNative: false,
  isStandalone: false,
  isBrowserMode: false,
  pathname: '/',
} as const;

describe('isInstallGateClosed', () => {
  it.each([
    { label: 'a phone browser tab', input: PHONE_TAB, expected: true },
    { label: 'a desktop browser', input: { ...PHONE_TAB, device: 'desktop' }, expected: false },
    { label: 'the installed app', input: { ...PHONE_TAB, isStandalone: true }, expected: false },
    {
      label: 'a password reset link from a mail',
      input: { ...PHONE_TAB, pathname: '/reset-password' },
      expected: false,
    },
    {
      label: 'the beer list itself',
      input: { ...PHONE_TAB, pathname: '/beer-list' },
      expected: true,
    },
    {
      label: 'an invitation link from a mail',
      input: { ...PHONE_TAB, pathname: '/invitation/AB12CD' },
      expected: false,
    },
    {
      label: 'a page that only starts like an invitation',
      input: { ...PHONE_TAB, pathname: '/invitations' },
      expected: true,
    },
  ] as const)('$label', ({ input, expected }) => {
    expect(isInstallGateClosed(input)).toBe(expected);
  });
});
