import { KkPromoStage } from '@furria/ui/KkPromoStage';
import type { FC } from 'react';
import { EVENT_COPY, SCREEN_TITLES } from '../../promo-copy';
import { screenOf } from '../../promo-screens';
import type { ReelSceneProps } from '../../reel-scene-props';

export const EventScene: FC<ReelSceneProps> = ({ phase, cut }) => (
  <KkPromoStage.Scene phase={phase} cut={cut}>
    <KkPromoStage.Copy>
      <KkPromoStage.Kicker numeral="3" label={EVENT_COPY.kicker} />
      <KkPromoStage.Headline line1={EVENT_COPY.line1} line2={EVENT_COPY.line2} size="display" />
      <KkPromoStage.Lead>{EVENT_COPY.lead}</KkPromoStage.Lead>
    </KkPromoStage.Copy>
    <KkPromoStage.Device
      centerX={1010}
      centerY={292}
      tilt={5}
      turn={-26}
      depth={0}
      entry="top"
      delay={0.55}
    >
      <KkPromoStage.Phone
        image={screenOf('table-plan')}
        title={SCREEN_TITLES.tablePlan}
        scale={0.5}
      />
    </KkPromoStage.Device>
    <KkPromoStage.Device
      centerX={820}
      centerY={378}
      tilt={-4}
      turn={-14}
      entry="bottom"
      delay={0.2}
    >
      <KkPromoStage.Phone image={screenOf('running-order')} title={SCREEN_TITLES.event} />
    </KkPromoStage.Device>
  </KkPromoStage.Scene>
);
