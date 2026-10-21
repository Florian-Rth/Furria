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
    { label: 'a tablet browser tab', input: { ...PHONE_TAB, device: 'tablet' }, expected: true },
    { label: 'a desktop browser', input: { ...PHONE_TAB, device: 'desktop' }, expected: false },
    { label: 'the installed app', input: { ...PHONE_TAB, isStandalone: true }, expected: false },
    { label: 'the native shell', input: { ...PHONE_TAB, isNative: true }, expected: false },
    {
      label: 'browser mode for testing',
      input: { ...PHONE_TAB, isBrowserMode: true },
      expected: false,
    },
    {
      label: 'a password reset link from a mail',
      input: { ...PHONE_TAB, pathname: '/reset-password' },
      expected: false,
    },
    {
      label: 'an invitation link from a mail',
      input: { ...PHONE_TAB, pathname: '/invitation/AB12CD' },
      expected: false,
    },
    {
      label: 'the invitation entry',
      input: { ...PHONE_TAB, pathname: '/invitation' },
      expected: false,
    },
    {
      label: 'a page that only starts like an invitation',
      input: { ...PHONE_TAB, pathname: '/invitations' },
      expected: true,
    },
    { label: 'the login page', input: { ...PHONE_TAB, pathname: '/login' }, expected: true },
  ] as const)('$label', ({ input, expected }) => {
    expect(isInstallGateClosed(input)).toBe(expected);
  });
});
