import type { HeroKind } from '@/features/act-practice/practice-controls';
import type { StudioTool } from './studio-copy';

export type ActStudioHeroKind = 'video' | 'stage' | 'wave' | 'editor';
export type ActStudioSideKind = 'stage' | 'note' | 'songs' | 'rail' | 'takes' | 'cast';
export type ActStudioStripKind = 'segments' | 'marks' | 'counts' | 'placement';

export interface ActStudioFrame {
  hero: ActStudioHeroKind;
  side: ActStudioSideKind;
  strip: ActStudioStripKind;
}

const practiceFrameOf = (filmed: HeroKind): ActStudioFrame =>
  filmed === 'video'
    ? { hero: 'video', side: 'stage', strip: 'segments' }
    : { hero: 'stage', side: 'note', strip: 'segments' };

export const largeTextFrameOf = (filmed: HeroKind, videoShown: boolean): ActStudioFrame => ({
  hero: filmed === 'video' && videoShown ? 'video' : 'stage',
  side: 'note',
  strip: 'segments',
});

export const studioFrameOf = (
  editing: boolean,
  tool: StudioTool,
  filmed: HeroKind,
): ActStudioFrame => {
  if (!editing) {
    return practiceFrameOf(filmed);
  }

  switch (tool) {
    case 'music':
      return { hero: 'wave', side: 'songs', strip: 'segments' };
    case 'steps':
      return { ...practiceFrameOf(filmed), side: 'rail', strip: 'marks' };
    case 'formation':
      return { hero: 'editor', side: 'cast', strip: 'segments' };
    case 'movement':
      return { hero: 'editor', side: 'cast', strip: 'counts' };
    case 'video':
      return { hero: filmed, side: 'takes', strip: 'placement' };
  }
};
