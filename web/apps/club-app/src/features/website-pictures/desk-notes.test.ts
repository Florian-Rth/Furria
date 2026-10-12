import { describe, expect, it } from 'vitest';
import type { DeskNote } from './desk-notes';
import { deskNotesOf } from './desk-notes';
import type { DeskPhase } from './hooks/use-position-desk';
import type { BoardPosition, PositionStatus } from './website-board';

const positionOf = (
  status: PositionStatus,
  { decorative = false, orphan = false }: { decorative?: boolean; orphan?: boolean } = {},
): BoardPosition => ({
  slot: 'events.filmstrip',
  slotTitle: 'Filmstreifen',
  position: 2,
  count: 8,
  aspect: 'landscape',
  decorative,
  status,
  picture: null,
  needsAlt: false,
  orphan,
});

describe('deskNotesOf', () => {
  it.each<[string, DeskPhase, BoardPosition, boolean, DeskNote[]]>([
    ['an empty position', 'view', positionOf('empty'), false, []],
    ['a shown picture', 'view', positionOf('ready'), false, ['replace']],
    ['a stale cut', 'view', positionOf('mismatch'), false, ['recut', 'replace']],
    ['a failed picture', 'view', positionOf('failed'), false, ['failed', 'replace']],
    ['a developing picture', 'view', positionOf('processing'), false, ['processing', 'replace']],
    [
      'a decorative slot',
      'view',
      positionOf('ready', { decorative: true }),
      false,
      ['replace', 'decorative'],
    ],
    ['an orphan', 'view', positionOf('ready', { orphan: true, decorative: true }), false, []],
    ['an upload the browser could not show', 'uploading', positionOf('empty'), true, ['uncut']],
    ['an upload cut before sending', 'uploading', positionOf('empty'), false, []],
    ['a cut in progress', 'cropping', positionOf('mismatch'), false, []],
  ])('explains %s', (_, phase, position, isUncutUpload, notes) => {
    expect(deskNotesOf(phase, position, isUncutUpload)).toEqual(notes);
  });
});
