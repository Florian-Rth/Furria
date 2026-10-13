import { describe, expect, it } from 'vitest';
import type { PictureEditing } from '@/lib/api/schemas';
import type { PictureDeskState } from '@/lib/media/picture-desk';
import { toEventBanner } from './event-picture';

const editing = (overrides: Partial<PictureEditing>): PictureEditing => ({
  state: 'ready',
  picture: { smallUrl: '/s', mediumUrl: '/m', largeUrl: '/l' },
  uncroppedUrl: '/u',
  crop: { left: 0, top: 0, width: 1, height: 0.5 },
  ...overrides,
});

const photo = { file: new File([], 'fest.jpg'), source: 'blob:fest' };
const resting: PictureDeskState = { kind: 'resting', attempt: 0 };
const cropping: PictureDeskState = {
  kind: 'cropping',
  attempt: 0,
  photo: null,
  source: '/u',
  initialCrop: null,
  crop: null,
};
const uploading: PictureDeskState = {
  kind: 'uploading',
  attempt: 1,
  photo,
  crop: null,
  share: 0.4,
};
const failed: PictureDeskState = {
  kind: 'failed',
  attempt: 1,
  photo,
  crop: null,
  failure: 'interrupted',
};

describe('toEventBanner', () => {
  it.each([
    ['no picture', null, resting, 'empty'],
    ['a stored picture', editing({}), resting, 'ready'],
    [
      'a fresh upload being rendered',
      editing({ state: 'processing', picture: null }),
      resting,
      'developing',
    ],
    ['a recrop being rendered', editing({ state: 'processing' }), resting, 'developing'],
    [
      'a photo the server gave up on',
      editing({ state: 'failed', picture: null }),
      resting,
      'failed',
    ],
    ['a stored picture being cut', editing({}), cropping, 'cropping'],
    ['a picture without original being cut', editing({ uncroppedUrl: null }), cropping, 'ready'],
    ['a local upload over a stored picture', editing({}), uploading, 'uploading'],
    ['a local upload that broke off', null, failed, 'failed'],
  ] as const)('shows %s', (_, stored, desk, state) => {
    expect(toEventBanner(stored, desk).state).toBe(state);
  });

  it('carries the upload share while sending', () => {
    expect(toEventBanner(null, uploading).progress).toBe(0.4);
  });
});
