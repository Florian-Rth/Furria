import { KkPromoStage } from '@furria/ui/KkPromoStage';
import type { FC } from 'react';
import { DANCE_COPY, SCREEN_TITLES } from '../../promo-copy';
import { screenOf } from '../../promo-screens';
import type { ReelSceneProps } from '../../reel-scene-props';

export const DanceScene: FC<ReelSceneProps> = ({ phase, cut }) => (
  <KkPromoStage.Scene phase={phase} cut={cut}>
    <KkPromoStage.Copy>
      <KkPromoStage.Kicker numeral="4" label={DANCE_COPY.kicker} />
      <KkPromoStage.Headline line1={DANCE_COPY.line1} line2={DANCE_COPY.line2} size="display" />
      <KkPromoStage.Lead>{DANCE_COPY.lead}</KkPromoStage.Lead>
    </KkPromoStage.Copy>
    <KkPromoStage.Device
      centerX={1030}
      centerY={300}
      tilt={6}
      turn={-28}
      depth={0}
      entry="right"
      delay={0.45}
    >
      <KkPromoStage.Phone image={screenOf('act')} title={SCREEN_TITLES.act} scale={0.52} />
    </KkPromoStage.Device>
    <KkPromoStage.Device
      centerX={810}
      centerY={372}
      tilt={-5}
      turn={-12}
      entry="right"
      delay={0.15}
    >
      <KkPromoStage.Phone image={screenOf('training')} title={SCREEN_TITLES.training} />
    </KkPromoStage.Device>
  </KkPromoStage.Scene>
);
