import { describe, expect, it } from 'vitest';
import type { DomainChange, ReadName } from './reads';
import { staleReadsAfter } from './reads';

describe('staleReadsAfter', () => {
  it.each<{ label: string; change: DomainChange; stale: ReadName[] }>([
    {
      label: 'a group membership opens or ends',
      change: 'groupMembership',
      stale: ['members', 'member', 'me', 'person', 'groupHub', 'myGroups', 'groups'],
    },
    {
      label: 'a group admin is appointed or steps down',
      change: 'groupAdmin',
      stale: ['me', 'person', 'groupHub', 'myGroups', 'managedGroups'],
    },
    {
      label: 'a role holding opens or ends',
      change: 'roleHolding',
      stale: ['rolesOverview', 'members', 'member', 'me', 'roles', 'role', 'person'],
    },
    {
      label: 'a role is renamed, archived or re-permissioned',
      change: 'role',
      stale: ['rolesOverview', 'boardRoleOptions', 'members', 'member', 'me', 'roles', 'role'],
    },
    {
      label: 'a board seat opens or ends',
      change: 'boardSeat',
      stale: ['board', 'clubHub', 'me', 'person'],
    },
    {
      label: 'a venue changes',
      change: 'venue',
      stale: ['runningVenues', 'managedVenues', 'clubHub', 'calendar', 'groupCalendar'],
    },
    {
      label: 'she answers a calendar entry',
      change: 'attendanceResponse',
      stale: ['start', 'calendar', 'groupCalendar'],
    },
    {
      label: 'a calendar entry is written',
      change: 'calendarEntry',
      stale: ['calendar', 'groupCalendar', 'trainingPreview', 'clubHub', 'start'],
    },
    {
      label: 'an account is invited, locked or redeemed',
      change: 'account',
      stale: ['persons', 'person', 'accessState', 'invitationRoundPreview', 'manageHub', 'me'],
    },
    {
      label: 'a portrait or group picture develops',
      change: 'picture',
      stale: ['me', 'members', 'persons', 'groups', 'start', 'clubHub', 'announcements', 'newsHub'],
    },
    {
      label: 'a news post is saved, published or withdrawn',
      change: 'newsPost',
      stale: ['newsHub'],
    },
    {
      label: 'a ticket request is handled, which moves the event steps',
      change: 'ticketRequest',
      stale: ['ticketRequests', 'events', 'event'],
    },
    {
      label: 'an album of the evening is published',
      change: 'media',
      stale: ['events', 'event'],
    },
    {
      label: 'a website picture is filled, cut, described or cleared',
      change: 'websitePicture',
      stale: ['websitePictures'],
    },
  ])('marks every read showing it stale when $label', ({ change, stale }) => {
    expect(staleReadsAfter([change])).toEqual(expect.arrayContaining(stale));
  });

  it.each<{ label: string; change: DomainChange; fresh: ReadName[] }>([
    {
      label: 'an answer leaves the club hub and group directory alone',
      change: 'attendanceResponse',
      fresh: ['clubHub', 'groups', 'groupHub'],
    },
    {
      label: 'a training slot leaves the group directory alone',
      change: 'trainingSlot',
      fresh: ['groups', 'myGroups'],
    },
    {
      label: 'a decision forgets the application instead of refetching it',
      change: 'membershipApplication',
      fresh: ['membershipApplication'],
    },
    {
      label: 'a seen announcement leaves the board alone',
      change: 'announcementSeen',
      fresh: ['announcements', 'clubHub'],
    },
    {
      label: 'a news post leaves what it can mention or tie alone',
      change: 'newsPost',
      fresh: ['newsMentionables', 'newsTieCandidates', 'galleryPickAlbum'],
    },
    {
      label: 'a website picture leaves the gallery it was copied from alone',
      change: 'websitePicture',
      fresh: ['galleryHub', 'album', 'galleryPickAlbum'],
    },
  ])('keeps the rest fresh when $label', ({ change, fresh }) => {
    const stale = staleReadsAfter([change]);

    expect(fresh.filter((read) => stale.includes(read))).toEqual([]);
  });

  it('names a read once when several of its changes happen together', () => {
    const stale = staleReadsAfter(['groupMembership', 'groupAdmin']);

    expect(stale.filter((read) => read === 'groupHub')).toHaveLength(1);
  });

  it('marks nothing stale when nothing changed', () => {
    expect(staleReadsAfter([])).toEqual([]);
  });
});
