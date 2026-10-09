import { describe, expect, it } from 'vitest';
import type { PictureEditing } from '@/lib/api/schemas';
import { toPictureStatus } from './picture-status';

const PICTURE = { smallUrl: '/s', mediumUrl: '/m', largeUrl: '/l' };

const editing = (overrides: Partial<PictureEditing>): PictureEditing => ({
  state: 'ready',
  picture: PICTURE,
  uncroppedUrl: '/u',
  crop: { left: 0, top: 0, width: 1, height: 1 },
  ...overrides,
});

describe('toPictureStatus', () => {
  it.each([
    ['no picture at all', null, 'none'],
    [
      'a fresh upload still being rendered',
      editing({ state: 'processing', picture: null }),
      'processing',
    ],
    ['a recrop being rendered over the shown cut', editing({ state: 'processing' }), 'shown'],
    ['a rendered picture', editing({}), 'shown'],
    ['a photo the worker gave up on', editing({ state: 'failed', picture: null }), 'failed'],
  ] as const)('reads %s', (_, value, status) => {
    expect(toPictureStatus(value)).toBe(status);
  });
});
