import { KkPromoStage } from '@furria/ui/KkPromoStage';
import type { FC } from 'react';
import { BEER_COPY, SCREEN_TITLES } from '../../promo-copy';
import { screenOf } from '../../promo-screens';
import type { ReelSceneProps } from '../../reel-scene-props';

export const BeerScene: FC<ReelSceneProps> = ({ phase, cut }) => (
  <KkPromoStage.Scene phase={phase} cut={cut}>
    <KkPromoStage.Copy>
      <KkPromoStage.Kicker numeral="7" label={BEER_COPY.kicker} />
      <KkPromoStage.Headline line1={BEER_COPY.line1} line2={BEER_COPY.line2} size="display" />
      <KkPromoStage.Lead>{BEER_COPY.lead}</KkPromoStage.Lead>
    </KkPromoStage.Copy>
    <KkPromoStage.Device centerX={880} centerY={366} tilt={4} turn={-20} entry="bottom">
      <KkPromoStage.Phone image={screenOf('beer-list')} title={SCREEN_TITLES.beer} />
    </KkPromoStage.Device>
  </KkPromoStage.Scene>
);
