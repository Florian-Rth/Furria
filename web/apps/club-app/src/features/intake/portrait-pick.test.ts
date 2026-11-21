import { describe, expect, it } from 'vitest';
import type { PortraitPick, PortraitPickEvent } from './portrait-pick';
import { advancePortraitPick, liveSourcesOf, NO_PORTRAIT, portraitBannerOf } from './portrait-pick';

const first = { file: new File(['a'], 'a.jpg'), source: 'blob:a' };
const second = { file: new File(['b'], 'b.jpg'), source: 'blob:b' };
const crop = { left: 0.1, top: 0.1, width: 0.5, height: 0.6 };
const otherCrop = { left: 0.2, top: 0, width: 0.4, height: 0.5 };
const cutFirst: PortraitPick = { kind: 'cut', portrait: { photo: first, crop } };

const run = (
  events: readonly PortraitPickEvent[],
  from: PortraitPick = NO_PORTRAIT,
): PortraitPick => events.reduce(advancePortraitPick, from);

describe('advancePortraitPick', () => {
  it.each<[string, PortraitPick, readonly PortraitPickEvent[], PortraitPick]>([
    [
      'a chosen photo is cut before it counts',
      NO_PORTRAIT,
      [{ kind: 'chosen', photo: first }, { kind: 'cropChanged', crop }, { kind: 'cutDone' }],
      cutFirst,
    ],
    [
      'a cut without a crop yet stays open',
      NO_PORTRAIT,
      [{ kind: 'chosen', photo: first }, { kind: 'cutDone' }],
      { kind: 'cutting', photo: first, initialCrop: null, crop: null, kept: null },
    ],
    [
      'cancelling a first photo leaves no portrait',
      NO_PORTRAIT,
      [{ kind: 'chosen', photo: first }, { kind: 'cutCancelled' }],
      NO_PORTRAIT,
    ],
    [
      'cancelling a replacement keeps the earlier portrait',
      cutFirst,
      [{ kind: 'chosen', photo: second }, { kind: 'cutCancelled' }],
      cutFirst,
    ],
    [
      'recutting starts from the kept crop and takes the new one',
      cutFirst,
      [{ kind: 'recut' }, { kind: 'cropChanged', crop: otherCrop }, { kind: 'cutDone' }],
      { kind: 'cut', portrait: { photo: first, crop: otherCrop } },
    ],
    [
      'a photo the browser cannot show goes uncut',
      NO_PORTRAIT,
      [{ kind: 'chosen', photo: second }, { kind: 'unreadable' }],
      { kind: 'cut', portrait: { photo: second, crop: null } },
    ],
    ['removing drops the portrait', cutFirst, [{ kind: 'removed' }], NO_PORTRAIT],
  ])('%s', (_, from, events, expected) => {
    expect(run(events, from)).toEqual(expected);
  });
});

describe('liveSourcesOf', () => {
  it.each<[string, PortraitPick, string[]]>([
    ['no portrait', NO_PORTRAIT, []],
    ['a cut portrait', cutFirst, ['blob:a']],
    [
      'a replacement being cut',
      run([{ kind: 'chosen', photo: second }], cutFirst),
      ['blob:b', 'blob:a'],
    ],
  ])('keeps %s alive', (_, pick, expected) => {
    expect(liveSourcesOf(pick)).toEqual(expected);
  });
});

describe('portraitBannerOf', () => {
  it.each<[string, PortraitPick, string, boolean]>([
    ['no portrait', NO_PORTRAIT, 'empty', false],
    ['a portrait being cut', run([{ kind: 'chosen', photo: first }]), 'cropping', false],
    ['a cut portrait', cutFirst, 'ready', true],
    [
      'a portrait the browser cannot show',
      run([{ kind: 'chosen', photo: first }, { kind: 'unreadable' }]),
      'ready',
      false,
    ],
  ])('shows %s', (_, pick, state, hasPreview) => {
    const banner = portraitBannerOf(pick);
    expect([banner.state, banner.preview !== null]).toEqual([state, hasPreview]);
  });
});
