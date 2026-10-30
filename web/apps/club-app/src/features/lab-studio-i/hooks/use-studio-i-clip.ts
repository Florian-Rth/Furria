import type { KkPracticeScreenVideoSource } from '@furria/ui/KkPracticeScreen';
import type { RefObject } from 'react';
import { useRef } from 'react';
import { useSlavedVideo } from '@/features/act-player/hooks/use-slaved-video';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { partOfStep } from '@/features/act-player/music-timeline';
import type { Studio } from '@/features/acts/schemas';
import {
  clipBadgeLabelOf,
  clipBadgeOf,
  clipRoleTextOf,
  rangeText,
  STUDIO_I_VIDEO_NONE,
  STUDIO_I_VIDEO_NONE_EYEBROW,
} from '../studio-i-copy';
import type { StepClip } from '../studio-i-video';
import { shiftedVideoOf, stepClipsOf } from '../studio-i-video';
import type { StudioIDrafts } from './use-studio-i-drafts';
import type { StudioIEdit } from './use-studio-i-edit';

export interface StudioIClipView {
  ref: RefObject<HTMLVideoElement | null>;
  clip: StepClip | null;
  count: number;
  shift: number;
  source: KkPracticeScreenVideoSource | null;
  name: string;
  meta: string;
  badge: string;
  badgeLabel: string;
  emptyEyebrow: string;
  emptyText: string;
  selected: boolean;
  partName: string | null;
  select: () => void;
}

export const useStudioIClip = (
  studio: Studio,
  playback: StudioPlayback,
  drafts: StudioIDrafts,
  edit: StudioIEdit,
): StudioIClipView => {
  const ref = useRef<HTMLVideoElement>(null);
  const span = edit.span;
  const part = span === null ? null : partOfStep(playback.parts, span.stepId);
  const clips = span === null ? [] : stepClipsOf(studio.videos, part, span);
  const clip = clips[0] ?? null;
  const shift = clip === null ? 0 : (drafts.shifts.get(clip.video.videoId) ?? 0);
  const video = clip === null ? null : shiftedVideoOf(clip.video, shift);

  useSlavedVideo(playback.player, video, ref);

  const name = clip === null ? STUDIO_I_VIDEO_NONE : (clip.video.name ?? '');
  const start = video?.startSeconds ?? 0;

  return {
    ref,
    clip,
    count: clips.length,
    shift,
    source: clip === null ? null : { video: clip.video.urls.video, poster: clip.video.urls.poster },
    name,
    meta:
      clip === null
        ? ''
        : `${clipRoleTextOf(clip.role, null)} · ${rangeText(start, start + (clip.video.durationSeconds ?? 0))}`,
    badge: clip === null ? '' : clipBadgeOf(clip.role, clips.length),
    badgeLabel: clipBadgeLabelOf(name),
    emptyEyebrow: STUDIO_I_VIDEO_NONE_EYEBROW,
    emptyText: STUDIO_I_VIDEO_NONE,
    selected: edit.selection?.kind === 'video',
    partName: part?.name ?? null,
    select: () => {
      edit.select({ kind: 'video' });
    },
  };
};
