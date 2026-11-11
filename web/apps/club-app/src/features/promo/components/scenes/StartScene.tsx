import { KkPromoStage } from '@furria/ui/KkPromoStage';
import type { FC } from 'react';
import { SCREEN_TITLES, START_COPY } from '../../promo-copy';
import { screenOf } from '../../promo-screens';
import { CREST_ORIGIN, HERO_PHONE } from '../../reel-placements';
import type { ReelSceneProps } from '../../reel-scene-props';

export const StartScene: FC<ReelSceneProps> = ({ phase, cut }) => (
  <KkPromoStage.Scene phase={phase} cut={cut} origin={CREST_ORIGIN}>
    <KkPromoStage.Copy>
      <KkPromoStage.Kicker numeral="1" label={START_COPY.kicker} />
      <KkPromoStage.Headline line1={START_COPY.line1} line2={START_COPY.line2} />
      <KkPromoStage.Lead>{START_COPY.lead}</KkPromoStage.Lead>
    </KkPromoStage.Copy>
    <KkPromoStage.Device {...HERO_PHONE}>
      <KkPromoStage.Phone image={screenOf('start')} title={SCREEN_TITLES.start} />
    </KkPromoStage.Device>
  </KkPromoStage.Scene>
);
