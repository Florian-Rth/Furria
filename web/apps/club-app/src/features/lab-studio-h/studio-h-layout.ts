import type { HeroKind } from '@/features/act-practice/practice-controls';
import type { StudioTool } from './studio-h-copy';

export type StudioHHeroKind = 'video' | 'stage' | 'wave' | 'editor';
export type StudioHSideKind = 'stage' | 'note' | 'songs' | 'takes' | 'cast';
export type StudioHStripKind = 'segments' | 'marks' | 'counts' | 'placement';

export interface StudioHFrame {
  hero: StudioHHeroKind;
  side: StudioHSideKind;
  strip: StudioHStripKind;
}

const practiceFrameOf = (filmed: HeroKind): StudioHFrame =>
  filmed === 'video'
    ? { hero: 'video', side: 'stage', strip: 'segments' }
    : { hero: 'stage', side: 'note', strip: 'segments' };

export const studioFrameOf = (
  editing: boolean,
  tool: StudioTool,
  filmed: HeroKind,
): StudioHFrame => {
  if (!editing) {
    return practiceFrameOf(filmed);
  }

  switch (tool) {
    case 'music':
      return { hero: 'wave', side: 'songs', strip: 'segments' };
    case 'steps':
      return { ...practiceFrameOf(filmed), strip: 'marks' };
    case 'formation':
      return { hero: 'editor', side: 'cast', strip: 'segments' };
    case 'movement':
      return { hero: 'editor', side: 'cast', strip: 'counts' };
    case 'video':
      return { hero: filmed, side: 'takes', strip: 'placement' };
  }
};
