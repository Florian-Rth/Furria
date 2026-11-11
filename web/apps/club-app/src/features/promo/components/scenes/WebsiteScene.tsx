import { KkPromoStage } from '@furria/ui/KkPromoStage';
import type { FC } from 'react';
import { SCREEN_TITLES, WEBSITE_ADDRESS, WEBSITE_COPY } from '../../promo-copy';
import { screenOf } from '../../promo-screens';
import type { ReelSceneProps } from '../../reel-scene-props';

export const WebsiteScene: FC<ReelSceneProps> = ({ phase, cut }) => (
  <KkPromoStage.Scene phase={phase} cut={cut}>
    <KkPromoStage.Copy>
      <KkPromoStage.Kicker numeral="6" label={WEBSITE_COPY.kicker} />
      <KkPromoStage.Headline line1={WEBSITE_COPY.line1} line2={WEBSITE_COPY.line2} size="display" />
      <KkPromoStage.Lead>{WEBSITE_COPY.lead}</KkPromoStage.Lead>
    </KkPromoStage.Copy>
    <KkPromoStage.Device
      centerX={935}
      centerY={300}
      tilt={-2}
      turn={-14}
      entry="right"
      delay={0.15}
    >
      <KkPromoStage.Browser
        image={screenOf('website')}
        address={WEBSITE_ADDRESS}
        title={SCREEN_TITLES.website}
        scale={0.44}
      />
    </KkPromoStage.Device>
    <KkPromoStage.Device
      centerX={790}
      centerY={470}
      tilt={-6}
      turn={-8}
      depth={2}
      entry="bottom"
      delay={0.55}
    >
      <KkPromoStage.Phone
        image={screenOf('website-events')}
        title={SCREEN_TITLES.websiteEvents}
        scale={0.45}
      />
    </KkPromoStage.Device>
  </KkPromoStage.Scene>
);
