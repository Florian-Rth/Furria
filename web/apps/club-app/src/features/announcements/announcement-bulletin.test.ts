import { describe, expect, it } from 'vitest';
import type { AnnouncementAddOnMark } from './announcement-add-ons';
import { toAnnouncementShelves, toBulletinMark } from './announcement-bulletin';

const markIn = (state: AnnouncementAddOnMark['state']): AnnouncementAddOnMark => ({
  key: state,
  kind: 'poll',
  state,
  name: null,
  until: null,
});

describe('toBulletinMark', () => {
  it.each<{
    label: string;
    states: AnnouncementAddOnMark['state'][];
    isNew: boolean;
    isExpired: boolean;
    expected: ReturnType<typeof toBulletinMark>;
  }>([
    {
      label: 'an owed answer beats new',
      states: ['owed'],
      isNew: true,
      isExpired: false,
      expected: 'owed',
    },
    {
      label: 'new without owed answers',
      states: ['answered'],
      isNew: true,
      isExpired: false,
      expected: 'new',
    },
    {
      label: 'seen and answered',
      states: ['answered'],
      isNew: false,
      isExpired: false,
      expected: 'none',
    },
    {
      label: 'expired stays quiet',
      states: ['owed'],
      isNew: true,
      isExpired: true,
      expected: 'none',
    },
  ])('marks $label', ({ states, isNew, isExpired, expected }) => {
    expect(toBulletinMark(states.map(markIn), isNew, isExpired)).toBe(expected);
  });
});

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
