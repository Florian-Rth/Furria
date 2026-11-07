import type { KkBannerState } from '@furria/ui/banner-desk-types';
import type { KkCrop } from '@furria/ui/image-crop';
import type { SessionLogoEditing } from './schemas';

export type SessionLogoDraft =
  | { kind: 'kept' }
  | { kind: 'recut'; crop: KkCrop }
  | { kind: 'staged'; file: File; source: string; aspect: number | null; crop: KkCrop | null }
  | { kind: 'cleared' };

export interface SessionLogoCut {
  crop: KkCrop | null;
}

export interface SessionLogoDesk {
  draft: SessionLogoDraft;
  cut: SessionLogoCut | null;
}

export type SessionLogoChange = 'none' | 'upload' | 'recut' | 'remove';

export type SessionLogoNote = 'none' | 'upload' | 'recut';

export interface SessionLogoPreview {
  source: string;
  crop: KkCrop;
}

export interface SessionLogoBanner {
  state: KkBannerState;
  aspect: number;
  source: string | null;
  uncroppedSource: string | null;
  crop: KkCrop | null;
  preview: SessionLogoPreview | null;
  note: SessionLogoNote;
}

export interface StagedLogoFile {
  file: File;
  source: string;
  aspect: number | null;
}

export const SQUARE_LOGO = 1;

export const KEPT_LOGO_DESK: SessionLogoDesk = { draft: { kind: 'kept' }, cut: null };

export const logoChangeOf = (
  draft: SessionLogoDraft,
  hasStoredLogo: boolean,
): SessionLogoChange => {
  switch (draft.kind) {
    case 'kept':
      return 'none';
    case 'recut':
      return 'recut';
    case 'staged':
      return 'upload';
    case 'cleared':
      return hasStoredLogo ? 'remove' : 'none';
  }
};

export const isLogoReadable = (aspect: number | null): aspect is number =>
  aspect !== null && Number.isFinite(aspect) && aspect > 0;

export const wholeLogoAspectOf = (stored: SessionLogoEditing | null): number => {
  const logo = stored?.logo ?? null;
  if (logo === null) {
    return SQUARE_LOGO;
  }
  const crop = stored?.crop ?? null;

  return crop === null || crop.width <= 0 ? logo.aspect : (logo.aspect * crop.height) / crop.width;
};

const storedCropOf = (stored: SessionLogoEditing | null): KkCrop | null => stored?.crop ?? null;

const currentCropOf = (
  stored: SessionLogoEditing | null,
  draft: SessionLogoDraft,
): KkCrop | null => {
  switch (draft.kind) {
    case 'recut':
      return draft.crop;
    case 'staged':
      return draft.crop;
    case 'kept':
      return storedCropOf(stored);
    case 'cleared':
      return null;
  }
};

const canCut = (stored: SessionLogoEditing | null, draft: SessionLogoDraft): boolean => {
  switch (draft.kind) {
    case 'staged':
      return isLogoReadable(draft.aspect);
    case 'kept':
    case 'recut':
      return stored?.uncroppedUrl != null;
    case 'cleared':
      return false;
  }
};

export const stageLogo = ({ file, source, aspect }: StagedLogoFile): SessionLogoDesk => {
  const isReadable = isLogoReadable(aspect);

  return {
    draft: { kind: 'staged', file, source, aspect: isReadable ? aspect : null, crop: null },
    cut: isReadable ? { crop: null } : null,
  };
};

export const startLogoCut = (
  desk: SessionLogoDesk,
  stored: SessionLogoEditing | null,
): SessionLogoDesk =>
  canCut(stored, desk.draft) ? { ...desk, cut: { crop: currentCropOf(stored, desk.draft) } } : desk;

export const changeLogoCut = (desk: SessionLogoDesk, crop: KkCrop): SessionLogoDesk =>
  desk.cut === null ? desk : { ...desk, cut: { crop } };

const cutDraftOf = (draft: SessionLogoDraft, crop: KkCrop): SessionLogoDraft =>
  draft.kind === 'staged' ? { ...draft, crop } : { kind: 'recut', crop };

export const finishLogoCut = (desk: SessionLogoDesk): SessionLogoDesk => {
  const crop = desk.cut?.crop ?? null;
  if (crop === null || desk.draft.kind === 'cleared') {
    return desk;
  }

  return { draft: cutDraftOf(desk.draft, crop), cut: null };
};

export const cancelLogoCut = (desk: SessionLogoDesk): SessionLogoDesk =>
  desk.draft.kind === 'staged' && desk.draft.crop === null && desk.cut !== null
    ? KEPT_LOGO_DESK
    : { ...desk, cut: null };

export const clearLogo = (): SessionLogoDesk => ({ draft: { kind: 'cleared' }, cut: null });

const EMPTY_BANNER: SessionLogoBanner = {
  state: 'empty',
  aspect: SQUARE_LOGO,
  source: null,
  uncroppedSource: null,
  crop: null,
  preview: null,
  note: 'none',
};

const storedStateOf = (stored: SessionLogoEditing): KkBannerState => {
  if (stored.state === 'failed') {
    return 'failed';
  }
  if (stored.logo === null) {
    return stored.isStalled ? 'stalled' : 'developing';
  }

  return 'ready';
};

const storedBannerOf = (stored: SessionLogoEditing | null): SessionLogoBanner =>
  stored === null
    ? EMPTY_BANNER
    : {
        state: storedStateOf(stored),
        aspect: wholeLogoAspectOf(stored),
        source: stored.logo?.picture.mediumUrl ?? null,
        uncroppedSource: stored.uncroppedUrl,
        crop: stored.crop,
        preview: null,
        note: 'none',
      };

const stagedBannerOf = (
  draft: Extract<SessionLogoDraft, { kind: 'staged' }>,
  cut: SessionLogoCut | null,
): SessionLogoBanner => {
  const base = {
    aspect: draft.aspect ?? SQUARE_LOGO,
    source: null,
    uncroppedSource: draft.source,
    note: 'upload',
  } as const;

  if (cut !== null) {
    return { ...base, state: 'cropping', crop: cut.crop, preview: null };
  }

  return {
    ...base,
    state: 'ready',
    crop: draft.crop,
    preview: draft.crop === null ? null : { source: draft.source, crop: draft.crop },
  };
};

const recutBannerOf = (
  stored: SessionLogoEditing | null,
  crop: KkCrop,
  cut: SessionLogoCut | null,
): SessionLogoBanner => {
  const banner = storedBannerOf(stored);
  const uncropped = banner.uncroppedSource;

  return {
    ...banner,
    state: cut === null ? 'ready' : 'cropping',
    source: null,
    crop: cut === null ? crop : cut.crop,
    preview: uncropped === null || cut !== null ? null : { source: uncropped, crop },
    note: 'recut',
  };
};

export const toSessionLogoBanner = (
  stored: SessionLogoEditing | null,
  { draft, cut }: SessionLogoDesk,
): SessionLogoBanner => {
  switch (draft.kind) {
    case 'cleared':
      return EMPTY_BANNER;
    case 'staged':
      return stagedBannerOf(draft, cut);
    case 'recut':
      return recutBannerOf(stored, draft.crop, cut);
    case 'kept': {
      const banner = storedBannerOf(stored);

      return cut === null ? banner : { ...banner, state: 'cropping', crop: cut.crop };
    }
  }
};

export interface DevelopingLogos {
  isDeveloping: boolean;
  isStalled: boolean;
}

export const developingLogosOf = (
  logos: readonly (SessionLogoEditing | null)[],
): DevelopingLogos => {
  const developing = logos.filter((logo) => logo?.state === 'processing');

  return {
    isDeveloping: developing.length > 0,
    isStalled: developing.length > 0 && developing.every((logo) => logo?.isStalled === true),
  };
};
