import type { HeroKind } from '@/features/act-practice/practice-controls';

export type ActStudioHeroKind = 'video' | 'stage';
export type ActStudioSideKind = 'stage' | 'note';

export interface ActStudioFrame {
  hero: ActStudioHeroKind;
  side: ActStudioSideKind;
}

export const practiceFrameOf = (filmed: HeroKind): ActStudioFrame =>
  filmed === 'video' ? { hero: 'video', side: 'stage' } : { hero: 'stage', side: 'note' };

export const largeTextFrameOf = (filmed: HeroKind, videoShown: boolean): ActStudioFrame => ({
  hero: filmed === 'video' && videoShown ? 'video' : 'stage',
  side: 'note',
});
