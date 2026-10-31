import type { SessionLogo } from '@/lib/api/schemas';
import type { SessionLogoEditing } from './schemas';

export type SessionLogoDraft =
  | { kind: 'kept' }
  | { kind: 'staged'; file: File; preview: string }
  | { kind: 'cleared' };

export type SessionLogoChange = 'none' | 'upload' | 'remove';

export type SessionLogoPreview =
  | { kind: 'none' }
  | { kind: 'staged'; source: string }
  | { kind: 'stored'; logo: SessionLogo }
  | { kind: 'developing' }
  | { kind: 'failed' };

export const KEPT_LOGO: SessionLogoDraft = { kind: 'kept' };

export const logoChangeOf = (
  draft: SessionLogoDraft,
  hasStoredLogo: boolean,
): SessionLogoChange => {
  switch (draft.kind) {
    case 'kept':
      return 'none';
    case 'staged':
      return 'upload';
    case 'cleared':
      return hasStoredLogo ? 'remove' : 'none';
  }
};

const storedPreviewOf = (stored: SessionLogoEditing | null): SessionLogoPreview => {
  if (stored === null) {
    return { kind: 'none' };
  }
  if (stored.logo !== null) {
    return { kind: 'stored', logo: stored.logo };
  }

  return stored.state === 'failed' ? { kind: 'failed' } : { kind: 'developing' };
};

export const logoPreviewOf = (
  stored: SessionLogoEditing | null,
  draft: SessionLogoDraft,
): SessionLogoPreview => {
  switch (draft.kind) {
    case 'kept':
      return storedPreviewOf(stored);
    case 'staged':
      return { kind: 'staged', source: draft.preview };
    case 'cleared':
      return { kind: 'none' };
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
