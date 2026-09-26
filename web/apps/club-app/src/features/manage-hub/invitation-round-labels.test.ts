import { describe, expect, it } from 'vitest';
import {
  toAccessRows,
  toAccessShareLine,
  toInvitationRoundAct,
  toRoundSentMessage,
  toWithoutEmailFact,
} from './invitation-round-labels';

describe('toInvitationRoundAct', () => {
  it.each([
    { inviteCount: 47, expected: 'Einladung an 47 Personen senden' },
    { inviteCount: 1, expected: 'Einladung an 1 Person senden' },
  ])('confirms the invitation round with its count: "$expected"', ({ inviteCount, expected }) => {
    const act = toInvitationRoundAct('invite', {
      inviteCount,
      remindCount: 0,
      eligibleWithoutEmailCount: 0,
    });

    expect(act.confirmLabel).toBe(expected);
  });

  it.each([
    { remindCount: 5, expected: 'Erinnerung an 5 Personen senden' },
    { remindCount: 1, expected: 'Erinnerung an 1 Person senden' },
  ])('confirms the reminder round with its count: "$expected"', ({ remindCount, expected }) => {
    const act = toInvitationRoundAct('remind', {
      inviteCount: 9,
      remindCount,
      eligibleWithoutEmailCount: 0,
    });

    expect(act.confirmLabel).toBe(expected);
  });

  it.each([
    { count: 1, expected: '1 Person bekommt jetzt eine Mail.' },
    { count: 3, expected: '3 Personen bekommen jetzt eine Mail.' },
  ])('names the consequence as "$expected"', ({ count, expected }) => {
    const act = toInvitationRoundAct('invite', {
      inviteCount: count,
      remindCount: 0,
      eligibleWithoutEmailCount: 0,
    });

    expect(act.consequence).toBe(expected);
  });

  it.each([
    { kind: 'invite' as const, inviteCount: 0, remindCount: 4, canSend: false },
    { kind: 'invite' as const, inviteCount: 2, remindCount: 0, canSend: true },
    { kind: 'remind' as const, inviteCount: 4, remindCount: 0, canSend: false },
    { kind: 'remind' as const, inviteCount: 0, remindCount: 2, canSend: true },
  ])(
    'lets the $kind round be sent ($canSend) with $inviteCount to invite and $remindCount to remind',
    ({ kind, inviteCount, remindCount, canSend }) => {
      const act = toInvitationRoundAct(kind, {
        inviteCount,
        remindCount,
        eligibleWithoutEmailCount: 0,
      });

      expect({ canSend: act.canSend, hasReason: act.blockedReason !== null }).toEqual({
        canSend,
        hasReason: !canSend,
      });
    },
  );
});

describe('toRoundSentMessage', () => {
  it.each([
    { kind: 'invite' as const, sentCount: 47, expected: 'Einladung an 47 Personen ist unterwegs.' },
    { kind: 'invite' as const, sentCount: 1, expected: 'Einladung an 1 Person ist unterwegs.' },
    { kind: 'invite' as const, sentCount: 0, expected: 'Es war niemand mehr einzuladen.' },
    { kind: 'remind' as const, sentCount: 3, expected: 'Erinnerung an 3 Personen ist unterwegs.' },
    { kind: 'remind' as const, sentCount: 0, expected: 'Es war niemand mehr zu erinnern.' },
  ])('reports $sentCount sent in the $kind round', ({ kind, sentCount, expected }) => {
    expect(toRoundSentMessage(kind, sentCount)).toBe(expected);
  });
});

describe('toWithoutEmailFact', () => {
  it.each([
    { count: 0, expected: 'bei allen hinterlegt' },
    { count: 1, expected: '1 Person – bekommt nichts' },
    { count: 3, expected: '3 Personen – bekommen nichts' },
  ])('states $count persons without email as "$expected"', ({ count, expected }) => {
    expect(toWithoutEmailFact(count)).toBe(expected);
  });
});

describe('toAccessShareLine', () => {
  it('states how many of the invitable have access', () => {
    const line = toAccessShareLine({
      withAccessCount: 62,
      ofCount: 80,
      openInvitationCount: 5,
      eligibleWithoutEmailCount: 3,
    });

    expect(line).toBe('62 von 80 haben Zugang');
  });
});

describe('toAccessRows', () => {
  it.each([
    { openInvitationCount: 0, expected: 'Keine Einladung offen' },
    { openInvitationCount: 1, expected: '1 Einladung noch offen' },
    { openInvitationCount: 5, expected: '5 Einladungen noch offen' },
  ])('sums up $openInvitationCount open invitations', ({ openInvitationCount, expected }) => {
    const rows = toAccessRows({
      withAccessCount: 1,
      ofCount: 2,
      openInvitationCount,
      eligibleWithoutEmailCount: 0,
    });

    expect(rows.find((row) => row.id === 'open-invitation')?.meta).toBe(expected);
  });

  it.each([
    { eligibleWithoutEmailCount: 0, expected: undefined },
    { eligibleWithoutEmailCount: 1, expected: '1 fehlt' },
    { eligibleWithoutEmailCount: 4, expected: '4 fehlen' },
  ])(
    'flags $eligibleWithoutEmailCount missing emails as $expected',
    ({ eligibleWithoutEmailCount, expected }) => {
      const rows = toAccessRows({
        withAccessCount: 1,
        ofCount: 2,
        openInvitationCount: 0,
        eligibleWithoutEmailCount,
      });

      expect(rows.find((row) => row.id === 'without-email')?.hint).toBe(expected);
    },
  );
});
