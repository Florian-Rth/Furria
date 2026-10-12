import { describe, expect, it } from 'vitest';
import type { DeskAction } from './desk-actions';
import { deskActionsOf } from './desk-actions';
import type { DeskPhase } from './hooks/use-position-desk';
import type { BoardPosition, PositionStatus } from './website-board';

const positionOf = (status: PositionStatus, orphan = false): BoardPosition => ({
  slot: 'landing.hero',
  slotTitle: 'Hero',
  position: 1,
  count: 1,
  aspect: 'landscape',
  decorative: false,
  status,
  picture:
    status === 'empty'
      ? null
      : {
          slot: 'landing.hero',
          position: 1,
          mediaItemId: 9,
          aspect: 1.4,
          alt: null,
          picture: {
            state: status === 'processing' || status === 'failed' ? status : 'ready',
            picture: null,
            uncroppedUrl: status === 'processing' ? null : '/u',
            crop: null,
          },
          updatedAt: '2026-10-12T10:00:00+00:00',
          updatedBy: null,
        },
  needsAlt: false,
  orphan,
});

const offer = { hasCopySources: true, hasTransferTargets: true };

describe('deskActionsOf', () => {
  it.each<[string, DeskPhase, BoardPosition, DeskAction[]]>([
    ['an empty position', 'view', positionOf('empty'), ['upload', 'gallery', 'copy']],
    [
      'a shown picture',
      'view',
      positionOf('ready'),
      ['upload', 'gallery', 'copy', 'crop', 'remove'],
    ],
    [
      'a picture cut to an old format',
      'view',
      positionOf('mismatch'),
      ['upload', 'gallery', 'copy', 'recut', 'remove'],
    ],
    [
      'a developing picture without an original yet',
      'view',
      positionOf('processing'),
      ['upload', 'gallery', 'copy', 'remove'],
    ],
    ['an orphan', 'view', positionOf('ready', true), ['transfer', 'remove']],
    ['a cut in progress', 'cropping', positionOf('ready'), ['commit', 'cancel']],
    ['a running upload', 'uploading', positionOf('empty'), ['cancel']],
    ['a failed upload', 'failed', positionOf('empty'), ['retry', 'cancel']],
  ])('offers %s its actions', (_, phase, position, actions) => {
    expect(deskActionsOf(phase, position, offer)).toEqual(actions);
  });

  it('leaves out copying and transferring when there is nothing to take or nowhere to go', () => {
    const none = { hasCopySources: false, hasTransferTargets: false };

    expect(deskActionsOf('view', positionOf('empty'), none)).toEqual(['upload', 'gallery']);
    expect(deskActionsOf('view', positionOf('ready', true), none)).toEqual(['remove']);
  });
});
