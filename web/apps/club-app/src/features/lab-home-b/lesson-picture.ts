import type { HeroKind } from '@/features/act-practice/practice-controls';
import type { OwnCue } from '@/features/act-practice/practice-way';

export type LessonPlace = 'main' | 'inset' | 'off';

export interface LessonPicturePlan {
  video: LessonPlace;
  stage: LessonPlace;
  swappable: boolean;
}

const NOW = 0;

export const lessonPictureOf = (hero: HeroKind, swapped: boolean): LessonPicturePlan => {
  if (hero === 'stage') {
    return { video: 'off', stage: 'main', swappable: false };
  }

  return swapped
    ? { video: 'inset', stage: 'main', swappable: true }
    : { video: 'main', stage: 'inset', swappable: true };
};

export const cueCountOf = (cue: OwnCue | null): number | null => {
  if (cue === null) {
    return null;
  }

  return cue.tone === 'now' ? NOW : cue.counts;
};

export const cueOfCount = (count: number | null): OwnCue | null => {
  if (count === null) {
    return null;
  }

  return count === NOW ? { tone: 'now' } : { tone: 'soon', counts: count };
};
