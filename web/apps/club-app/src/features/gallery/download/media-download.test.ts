import { describe, expect, it } from 'vitest';
import type { DownloadFailure, SavedMediaKind, SaveRoute, SaveTraits } from './media-download';
import {
  byteSizeLabel,
  closesOnDelivery,
  downloadFailureOfError,
  downloadFailureOfStatus,
  downloadFractionOf,
  expectedBytesOf,
  saveRouteOf,
  zipFileNameOf,
} from './media-download';

const errorNamed = (name: string): Error => {
  const error = new Error('x');
  error.name = name;
  return error;
};

describe('byteSizeLabel', () => {
  it.each<[number, string]>([
    [0, '0 B'],
    [999, '999 B'],
    [1_000, '1 KB'],
    [1_460_000, '1,5 MB'],
    [412_300_000, '412 MB'],
    [1_380_000_000, '1,4 GB'],
    [-5, '0 B'],
  ])('%d bytes', (bytes, expected) => {
    expect(byteSizeLabel(bytes)).toBe(expected);
  });
});

describe('downloadFractionOf', () => {
  it.each<[string, number, number, number | null]>([
    ['nothing received yet is open-ended', 0, 1_000, null],
    ['an unknown size is open-ended', 500, 0, null],
    ['halfway', 500, 1_000, 0.5],
    ['zip overhead beyond the estimate stays full', 1_050, 1_000, 1],
  ])('%s', (_, received, expected, fraction) => {
    expect(downloadFractionOf(received, expected)).toBe(fraction);
  });
});

describe('zipFileNameOf', () => {
  it.each<[string, string, string]>([
    ['keeps a plain title', 'Prunksitzung 2027', 'Prunksitzung 2027.zip'],
    ['replaces path characters', ' Gala: Teil 1/2 ', 'Gala_ Teil 1_2.zip'],
    ['falls back for an empty title', '   ', 'Album.zip'],
  ])('%s', (_, title, expected) => {
    expect(zipFileNameOf(title)).toBe(expected);
  });
});

describe('downloadFailureOfStatus', () => {
  it.each<[number, DownloadFailure]>([
    [403, 'expired'],
    [404, 'gone'],
    [500, 'unexpected'],
  ])('%d', (status, expected) => {
    expect(downloadFailureOfStatus(status)).toBe(expected);
  });
});

describe('downloadFailureOfError', () => {
  it.each<[string, DownloadFailure]>([
    ['QuotaExceededError', 'noSpace'],
    ['TypeError', 'interrupted'],
  ])('%s', (name, expected) => {
    expect(downloadFailureOfError(errorNamed(name))).toBe(expected);
  });
});

describe('saveRouteOf', () => {
  it.each<[string, SaveTraits, SaveRoute]>([
    ['iOS shares into Files', { system: 'ios', sharesFile: true }, 'share'],
    ['iOS without file sharing downloads', { system: 'ios', sharesFile: false }, 'download'],
    ['Android downloads even when it shares', { system: 'android', sharesFile: true }, 'download'],
    ['desktop downloads', { system: 'other', sharesFile: true }, 'download'],
  ])('%s', (_, traits, expected) => {
    expect(saveRouteOf(traits)).toBe(expected);
  });
});

describe('expectedBytesOf', () => {
  it.each<[string, number, string | null, number]>([
    ['an announced length wins', 1_000, '2048', 2_048],
    ['a streamed archive keeps the estimate', 1_000, null, 1_000],
    ['a zero length keeps the estimate', 1_000, '0', 1_000],
    ['garbage keeps the estimate', 1_000, 'abc', 1_000],
  ])('%s', (_, requested, announced, expected) => {
    expect(expectedBytesOf(requested, announced)).toBe(expected);
  });
});

describe('closesOnDelivery', () => {
  it.each<[SavedMediaKind, SaveRoute, boolean]>([
    ['original', 'download', true],
    ['original', 'share', false],
    ['album', 'download', false],
    ['album', 'share', false],
  ])('%s via %s', (kind, route, expected) => {
    expect(closesOnDelivery(kind, route)).toBe(expected);
  });
});
