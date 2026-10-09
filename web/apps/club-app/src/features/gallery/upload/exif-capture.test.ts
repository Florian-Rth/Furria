import { describe, expect, it } from 'vitest';
import { captureTimeOf, localStampOf } from './exif-capture';

const ascii = (text: string): number[] => [...text].map((letter) => letter.charCodeAt(0));

const u16 = (value: number, little: boolean): number[] =>
  little ? [value & 0xff, value >> 8] : [value >> 8, value & 0xff];

const u32 = (value: number, little: boolean): number[] =>
  little
    ? [value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, value >>> 24]
    : [value >>> 24, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];

const entry = (
  tag: number,
  type: number,
  count: number,
  value: number,
  little: boolean,
): number[] => [
  ...u16(tag, little),
  ...u16(type, little),
  ...u32(count, little),
  ...u32(value, little),
];

const jpegWith = (tiff: number[]): ArrayBuffer => {
  const app1 = [...ascii('Exif\0\0'), ...tiff];
  const bytes = [
    0xff,
    0xd8,
    0xff,
    0xe0,
    0x00,
    0x04,
    0x00,
    0x00,
    0xff,
    0xe1,
    ...u16(app1.length + 2, false),
    ...app1,
    0xff,
    0xda,
  ];
  return new Uint8Array(bytes).buffer;
};

const tiffWithOriginal = (little: boolean, stamp: string): number[] => {
  const header = [...ascii(little ? 'II' : 'MM'), ...u16(42, little), ...u32(8, little)];
  const ifd0 = [...u16(1, little), ...entry(0x8769, 4, 1, 26, little), ...u32(0, little)];
  const exifIfd = [...u16(1, little), ...entry(0x9003, 2, 20, 44, little), ...u32(0, little)];
  return [...header, ...ifd0, ...exifIfd, ...ascii(`${stamp}\0`)];
};

const tiffWithDateTimeOnly = (stamp: string): number[] => {
  const header = [...ascii('MM'), ...u16(42, false), ...u32(8, false)];
  const ifd0 = [...u16(1, false), ...entry(0x0132, 2, 20, 26, false), ...u32(0, false)];
  return [...header, ...ifd0, ...ascii(`${stamp}\0`)];
};

describe('captureTimeOf', () => {
  it.each<[string, ArrayBuffer, string | null]>([
    [
      'little-endian original',
      jpegWith(tiffWithOriginal(true, '2026:02:14 20:41:07')),
      '2026-02-14T20:41:07',
    ],
    [
      'big-endian original',
      jpegWith(tiffWithOriginal(false, '2025:11:11 11:11:00')),
      '2025-11-11T11:11:00',
    ],
    [
      'falls back to the file date time',
      jpegWith(tiffWithDateTimeOnly('2026:03:02 09:05:59')),
      '2026-03-02T09:05:59',
    ],
    ['an unset stamp', jpegWith(tiffWithOriginal(true, '0000:00:00 00:00:0x')), null],
    ['not a jpeg', new Uint8Array([0x89, 0x50, 0x4e, 0x47]).buffer, null],
    ['a jpeg without exif', new Uint8Array([0xff, 0xd8, 0xff, 0xda]).buffer, null],
    ['a cut-off segment', new Uint8Array([0xff, 0xd8, 0xff, 0xe1, 0x00, 0x40, 0x45]).buffer, null],
  ])('%s', (_, buffer, expected) => {
    expect(captureTimeOf(buffer)).toBe(expected);
  });
});

describe('localStampOf', () => {
  it('formats local wall-clock time without an offset', () => {
    expect(localStampOf(new Date(2026, 1, 14, 20, 4, 9).getTime())).toBe('2026-02-14T20:04:09');
  });
});
