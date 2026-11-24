import { describe, expect, it } from 'vitest';
import { toAnnouncementShelves } from './announcement-bulletin';

describe('toAnnouncementShelves', () => {
  it('shelves Aushänge past their last valid day as expired, keeping their order', () => {
    const shelves = toAnnouncementShelves(
      [
        { announcementId: 1, validUntil: null },
        { announcementId: 2, validUntil: '2027-01-17' },
        { announcementId: 3, validUntil: '2027-01-18' },
        { announcementId: 4, validUntil: '2027-01-10' },
      ],
      '2027-01-18',
    );

    expect({
      current: shelves.current.map((announcement) => announcement.announcementId),
      expired: shelves.expired.map((announcement) => announcement.announcementId),
    }).toEqual({ current: [1, 3], expired: [2, 4] });
  });
});
