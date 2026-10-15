import { describe, expect, it } from 'vitest';
import type { InvitationRoundEmphasis, InvitationRoundKind } from './invitation-round-labels';
import { toInvitationRoundAct, toInvitationRoundEmphasis } from './invitation-round-labels';
import type { PersonAccessFilter } from './person-access-filter';

describe('toInvitationRoundAct', () => {
  it.each([
    { kind: 'invite' as const, inviteCount: 0, remindCount: 4, count: 0, canSend: false },
    { kind: 'invite' as const, inviteCount: 2, remindCount: 0, count: 2, canSend: true },
    { kind: 'remind' as const, inviteCount: 4, remindCount: 0, count: 0, canSend: false },
    { kind: 'remind' as const, inviteCount: 0, remindCount: 2, count: 2, canSend: true },
  ])(
    'counts $count for the $kind round and lets it be sent ($canSend)',
    ({ kind, inviteCount, remindCount, count, canSend }) => {
      const act = toInvitationRoundAct(kind, {
        inviteCount,
        remindCount,
        eligibleWithoutEmailCount: 0,
      });

      expect({
        count: act.count,
        canSend: act.canSend,
        hasReason: act.blockedReason !== null,
      }).toEqual({ count, canSend, hasReason: !canSend });
    },
  );
});

describe('toInvitationRoundEmphasis', () => {
  it.each<{
    kind: InvitationRoundKind;
    filter: PersonAccessFilter | null;
    expected: InvitationRoundEmphasis;
  }>([
    { kind: 'invite', filter: null, expected: 'lead' },
    { kind: 'remind', filter: null, expected: 'aside' },
    { kind: 'invite', filter: 'none', expected: 'lead' },
    { kind: 'remind', filter: 'none', expected: 'aside' },
    { kind: 'invite', filter: 'invited', expected: 'aside' },
    { kind: 'remind', filter: 'invited', expected: 'lead' },
    { kind: 'invite', filter: 'active', expected: 'aside' },
    { kind: 'remind', filter: 'without-email', expected: 'aside' },
  ])(
    'leads with the $kind round ($expected) under the $filter filter',
    ({ kind, filter, expected }) => {
      expect(toInvitationRoundEmphasis(kind, filter)).toBe(expected);
    },
  );
});
