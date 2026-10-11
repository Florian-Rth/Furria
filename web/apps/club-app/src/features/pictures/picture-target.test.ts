import { describe, expect, it } from 'vitest';
import { toPicturePath } from './picture-target';

describe('toPicturePath', () => {
  it.each([
    [{ kind: 'portrait', ownerId: 7 } as const, '/api/persons/7/portrait'],
    [{ kind: 'groupPicture', ownerId: 3 } as const, '/api/groups/3/picture'],
  ])('addresses the picture of its owner', (target, path) => {
    expect(toPicturePath(target)).toBe(path);
  });
});
