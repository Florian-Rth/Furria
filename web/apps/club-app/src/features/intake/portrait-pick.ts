import type { KkBannerState } from '@furria/ui/banner-desk-types';
import type { KkCrop } from '@furria/ui/image-crop';
import type { KkBannerPreview } from '@furria/ui/KkBannerDesk';

export interface PortraitPhoto {
  file: File;
  source: string;
}

export interface PortraitCut {
  photo: PortraitPhoto;
  crop: KkCrop | null;
}

export type PortraitPick =
  | { kind: 'none' }
  | {
      kind: 'cutting';
      photo: PortraitPhoto;
      initialCrop: KkCrop | null;
      crop: KkCrop | null;
      kept: PortraitCut | null;
    }
  | { kind: 'cut'; portrait: PortraitCut };

export type PortraitPickEvent =
  | { kind: 'chosen'; photo: PortraitPhoto }
  | { kind: 'recut' }
  | { kind: 'cropChanged'; crop: KkCrop }
  | { kind: 'cutDone' }
  | { kind: 'cutCancelled' }
  | { kind: 'unreadable' }
  | { kind: 'removed' };

export const NO_PORTRAIT: PortraitPick = { kind: 'none' };

const keptOf = (pick: PortraitPick): PortraitCut | null => {
  switch (pick.kind) {
    case 'none':
      return null;
    case 'cutting':
      return pick.kept;
    case 'cut':
      return pick.portrait;
  }
};

const restingOn = (portrait: PortraitCut | null): PortraitPick =>
  portrait === null ? NO_PORTRAIT : { kind: 'cut', portrait };

export const advancePortraitPick = (pick: PortraitPick, event: PortraitPickEvent): PortraitPick => {
  switch (event.kind) {
    case 'chosen':
      return {
        kind: 'cutting',
        photo: event.photo,
        initialCrop: null,
        crop: null,
        kept: keptOf(pick),
      };
    case 'recut':
      return pick.kind === 'cut'
        ? {
            kind: 'cutting',
            photo: pick.portrait.photo,
            initialCrop: pick.portrait.crop,
            crop: pick.portrait.crop,
            kept: pick.portrait,
          }
        : pick;
    case 'cropChanged':
      return pick.kind === 'cutting' ? { ...pick, crop: event.crop } : pick;
    case 'cutDone':
      return pick.kind === 'cutting' && pick.crop !== null
        ? { kind: 'cut', portrait: { photo: pick.photo, crop: pick.crop } }
        : pick;
    case 'cutCancelled':
      return pick.kind === 'cutting' ? restingOn(pick.kept) : pick;
    case 'unreadable':
      return pick.kind === 'cutting'
        ? { kind: 'cut', portrait: { photo: pick.photo, crop: null } }
        : pick;
    case 'removed':
      return NO_PORTRAIT;
  }
};

export const portraitOf = (pick: PortraitPick): PortraitCut | null =>
  pick.kind === 'cut' ? pick.portrait : null;

export const liveSourcesOf = (pick: PortraitPick): string[] => {
  switch (pick.kind) {
    case 'none':
      return [];
    case 'cutting':
      return pick.kept === null ? [pick.photo.source] : [pick.photo.source, pick.kept.photo.source];
    case 'cut':
      return [pick.portrait.photo.source];
  }
};

export interface PortraitBanner {
  state: KkBannerState;
  uncroppedSource: string | null;
  crop: KkCrop | null;
  preview: KkBannerPreview | null;
}

export const portraitBannerOf = (pick: PortraitPick): PortraitBanner => {
  switch (pick.kind) {
    case 'none':
      return { state: 'empty', uncroppedSource: null, crop: null, preview: null };
    case 'cutting':
      return {
        state: 'cropping',
        uncroppedSource: pick.photo.source,
        crop: pick.initialCrop,
        preview: null,
      };
    case 'cut': {
      const { photo, crop } = pick.portrait;
      const preview = crop === null ? null : { source: photo.source, crop };
      return { state: 'ready', uncroppedSource: photo.source, crop, preview };
    }
  }
};
