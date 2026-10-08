import { describe, expect, it } from 'vitest';
import { resolvePhotoFrame } from './photo-frame';

describe('resolvePhotoFrame', () => {
  it.each(['portrait', 'landscape'] as const)(
    'derives whole intrinsic %s dimensions that match the aspect ratio',
    (orientation) => {
      const frame = resolvePhotoFrame(orientation);
      const [widthUnits, heightUnits] = frame.aspectRatio.split('/').map(Number);

      expect(Number.isInteger(frame.width)).toBe(true);
      expect(frame.width / frame.height).toBeCloseTo(Number(widthUnits) / Number(heightUnits));
    },
  );
});
