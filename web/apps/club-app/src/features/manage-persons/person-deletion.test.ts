import { describe, expect, it } from 'vitest';
import type { ErasureNotice } from './person-deletion';
import { toErasureNotice } from './person-deletion';

describe('toErasureNotice', () => {
  it.each<{
    case: string;
    isSelf: boolean;
    accountState: 'noAccess' | 'invited' | 'active' | 'disabled';
    expected: ErasureNotice;
  }>([
    { case: 'herself', isSelf: true, accountState: 'active', expected: 'signsOutSelf' },
    { case: 'an active account', isSelf: false, accountState: 'active', expected: 'mailsHolder' },
    {
      case: 'a disabled account',
      isSelf: false,
      accountState: 'disabled',
      expected: 'mailsHolder',
    },
    {
      case: 'a person only invited',
      isSelf: false,
      accountState: 'invited',
      expected: 'tellsNobody',
    },
  ])('tells $case as $expected', ({ isSelf, accountState, expected }) => {
    expect(toErasureNotice(isSelf, accountState)).toBe(expected);
  });
});
