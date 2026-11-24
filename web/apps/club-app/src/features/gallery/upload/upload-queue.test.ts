import { describe, expect, it } from 'vitest';
import type { FileVerdict } from './upload-queue';
import { verdictOfFile } from './upload-queue';

const MB = 1024 * 1024;

describe('verdictOfFile', () => {
  it.each<[string, string, number, FileVerdict]>([
    ['IMG_0002.HEIC', '', 3 * MB, { kind: 'photo' }],
    ['huge.jpg', 'image/jpeg', 101 * MB, { refused: 'tooLarge' }],
    ['raw.CR3', '', 30 * MB, { refused: 'notAccepted' }],
  ])('%s', (name, type, size, expected) => {
    expect(verdictOfFile(name, type, size)).toEqual(expected);
  });
});
