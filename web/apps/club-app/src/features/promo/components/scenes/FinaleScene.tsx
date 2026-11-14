import { KkConfettiRain } from '@furria/ui/KkConfettiRain';
import { KkPromoStage } from '@furria/ui/KkPromoStage';
import type { FC } from 'react';
import { FINALE_COPY } from '../../promo-copy';
import type { ReelSceneProps } from '../../reel-scene-props';

const WALL_HEIGHT = 330;
const RAIN_COUNT = 16;

export const FinaleScene: FC<ReelSceneProps> = ({ phase, cut, wallNames }) => {
  const live = phase === 'live';
  const rain = live ? <KkConfettiRain count={RAIN_COUNT} alwaysPlays /> : null;

  return (
    <KkPromoStage.Scene phase={phase} cut={cut}>
      {rain}
      <KkPromoStage.Copy top={110} width={720}>
        <KkPromoStage.Headline
          line1={FINALE_COPY.line1}
          line2={FINALE_COPY.line2}
          size="display"
          delay={0.2}
        />
        <KkPromoStage.Lead delay={0.6}>{FINALE_COPY.lead}</KkPromoStage.Lead>
        <KkPromoStage.NameWall names={wallNames} height={WALL_HEIGHT} delay={0.9} />
      </KkPromoStage.Copy>
    </KkPromoStage.Scene>
  );
};
