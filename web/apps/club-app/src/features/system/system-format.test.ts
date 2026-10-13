import { describe, expect, it } from 'vitest';
import {
  formatBytes,
  formatClockSeconds,
  formatCount,
  formatPercent,
  formatSpan,
  formatVersion,
} from './system-format';

describe('formatVersion', () => {
  it.each([
    { version: '0.2.0+98e406f5ab4591d0a1f3b5', expected: '0.2.0 · 98e406f' },
    { version: '0.2.0', expected: '0.2.0' },
    { version: '0.2.0+', expected: '0.2.0+' },
  ])('shortens $version', ({ version, expected }) => {
    expect(formatVersion(version)).toBe(expected);
  });
});

describe('formatBytes', () => {
  it.each<{ bytes: number; text: string }>([
    { bytes: 0, text: '0 B' },
    { bytes: 812, text: '812 B' },
    { bytes: 1536, text: '1,5 KB' },
    { bytes: 1_288_490_189, text: '1,2 GB' },
    { bytes: 442_381_631_488, text: '412 GB' },
    { bytes: 3 * 1024 ** 5, text: '3.072 TB' },
  ])('writes $bytes bytes as $text', ({ bytes, text }) => {
    expect(formatBytes(bytes)).toBe(text);
  });
});

describe('formatSpan', () => {
  it.each<{ seconds: number; text: string }>([
    { seconds: 12, text: '< 1 Min' },
    { seconds: 7 * 60 + 40, text: '7 Min' },
    { seconds: 5 * 3600, text: '5 Std' },
    { seconds: 47 * 3600, text: '47 Std' },
    { seconds: 3 * 86_400 + 100, text: '3 Tg' },
    { seconds: -5, text: '< 1 Min' },
  ])('writes $seconds seconds as $text', ({ seconds, text }) => {
    expect(formatSpan(seconds)).toBe(text);
  });
});

describe('formatCount', () => {
  it('groups thousands', () => {
    expect(formatCount(12345)).toBe('12.345');
  });
});

describe('formatPercent', () => {
  it.each<{ share: number; text: string }>([
    { share: 0.124, text: '12 %' },
    { share: 1.4, text: '100 %' },
  ])('writes $share as $text', ({ share, text }) => {
    expect(formatPercent(share)).toBe(text);
  });
});

describe('formatClockSeconds', () => {
  it('pads hours, minutes and seconds', () => {
    expect(formatClockSeconds(new Date(2026, 9, 13, 9, 4, 7))).toBe('09:04:07');
  });
});
