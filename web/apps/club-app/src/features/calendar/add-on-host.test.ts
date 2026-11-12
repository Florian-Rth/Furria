import { describe, expect, it } from 'vitest';
import { toReminderPath } from './add-on-host';

describe('toReminderPath', () => {
  it.each([
    [{ kind: 'calendarEntry', calendarEntryId: 4 }, '/api/calendar/entries/4/reminders'],
    [{ kind: 'announcement', announcementId: 9 }, '/api/announcements/9/reminders'],
  ] as const)('reminds through the host %o', (host, expected) => {
    expect(toReminderPath(host)).toBe(expected);
  });
});
