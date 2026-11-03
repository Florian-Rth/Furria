import type { HeroKind } from '@furria/studio/practice-controls';

export type ActStudioHeroKind = 'video' | 'stage';

export interface ActStudioFrame {
  hero: ActStudioHeroKind;
}

export const largeTextFrameOf = (filmed: HeroKind, videoShown: boolean): ActStudioFrame => ({
  hero: filmed === 'video' && videoShown ? 'video' : 'stage',
});
