import { describe, expect, it } from 'vitest';
import { AnnouncementAddOnSchema } from './schemas';

describe('AnnouncementAddOnSchema', () => {
  it('turns a taken-over add-on into a borrowed one naming the lent kind', () => {
    const entry = {
      calendarEntryId: 9,
      title: 'Umzug',
      startsAt: '2026-11-21T13:00:00+00:00',
      endsAt: null,
      kind: 'trip',
      venueId: null,
      venueName: null,
      ownerGroupId: null,
      ownerGroupName: null,
      ownerGroupTone: null,
      participatingGroups: [],
      audience: 'club',
      audienceGroups: [],
      audiencePeople: [],
      asksForResponse: true,
      addOns: [{ kind: 'attendance' }],
      openFunctions: [],
      attendance: null,
      description: null,
      viewerAnswer: null,
      mayAnswer: true,
      isRunning: false,
      event: null,
    };

    const parsed = AnnouncementAddOnSchema.parse({
      kind: 'attendance',
      attendance: null,
      poll: null,
      signUpList: null,
      borrowed: { addOnId: null, entry },
    });

    expect(
      parsed.kind === 'borrowed'
        ? [parsed.kind, parsed.lentKind, parsed.addOnId, parsed.entry.calendarEntryId]
        : null,
    ).toEqual(['borrowed', 'attendance', null, 9]);
  });
});
