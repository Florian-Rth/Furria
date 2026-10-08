import { describe, expect, it } from 'vitest';
import { toInvitationRoundAct } from './invitation-round-labels';

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
