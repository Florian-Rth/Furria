import { describe, expect, it } from 'vitest';
import { toPicturePath, toUploadFailure, toUploadMetadata } from './picture-target';

const PORTRAIT_OF_ANNA = { kind: 'portrait', ownerId: 7 } as const;
const GARDE_PICTURE = { kind: 'groupPicture', ownerId: 3 } as const;

describe('toPicturePath', () => {
  it.each([
    [PORTRAIT_OF_ANNA, '/api/persons/7/portrait'],
    [GARDE_PICTURE, '/api/groups/3/picture'],
  ])('addresses the picture of its owner', (target, path) => {
    expect(toPicturePath(target)).toBe(path);
  });
});

describe('toUploadMetadata', () => {
  it('names the owner and the file and carries the chosen cut', () => {
    expect(
      toUploadMetadata(GARDE_PICTURE, 'garde.jpg', {
        left: 0,
        top: 0.25,
        width: 1,
        height: 0.5,
      }),
    ).toEqual({ owner: 'group:3', filename: 'garde.jpg', crop: '0,0.25,1,0.5' });
  });

  it('leaves the cut to the server when the photo could not be shown for cutting', () => {
    expect(toUploadMetadata(PORTRAIT_OF_ANNA, 'IMG_0001.HEIC', null)).toEqual({
      owner: 'person:7',
      filename: 'IMG_0001.HEIC',
    });
  });
});

describe('toUploadFailure', () => {
  it.each([
    [413, 'tooLarge'],
    [415, 'notAPhoto'],
    [403, 'notAllowed'],
    [404, 'gone'],
    [500, 'interrupted'],
    [null, 'interrupted'],
  ] as const)('reads status %s as %s', (status, failure) => {
    expect(toUploadFailure(status)).toBe(failure);
  });
});
