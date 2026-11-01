import { describe, expect, it } from 'vitest';
import { ownerOfSearch, ownerOfValue, searchOfOwner, valueOfOwner } from './inbox-owner';
import type { InboxOwner } from './types';

const OWNERS: { label: string; owner: InboxOwner }[] = [
  { label: 'her own inbox', owner: { kind: 'mine' } },
  { label: 'the ownerless inbox', owner: { kind: 'ownerless' } },
  { label: "another uploader's inbox", owner: { kind: 'uploader', personId: 17 } },
  { label: "an upload link's inbox", owner: { kind: 'link', uploadLinkId: 4 } },
];

describe('inbox owner', () => {
  it.each(OWNERS)('keeps $label through the picker', ({ owner }) => {
    expect(ownerOfValue(valueOfOwner(owner))).toEqual(owner);
  });

  it.each(OWNERS)('keeps $label through the address', ({ owner }) => {
    expect(ownerOfSearch(searchOfOwner(owner))).toEqual(owner);
  });

  it('opens the link inbox when the address names a link and an uploader', () => {
    expect(ownerOfSearch({ uploader: 17, link: 4 })).toEqual({ kind: 'link', uploadLinkId: 4 });
  });
});
