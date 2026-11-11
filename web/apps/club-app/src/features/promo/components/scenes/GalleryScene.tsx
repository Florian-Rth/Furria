import { KkPromoStage } from '@furria/ui/KkPromoStage';
import type { FC } from 'react';
import { GALLERY_COPY, SCREEN_TITLES } from '../../promo-copy';
import { PROMO_PHOTOS } from '../../promo-photos';
import { screenOf } from '../../promo-screens';
import type { ReelSceneProps } from '../../reel-scene-props';

const MASK_ORIGIN = { x: 76, y: 46 } as const;

export const GalleryScene: FC<ReelSceneProps> = ({ phase, cut }) => (
  <KkPromoStage.Scene phase={phase} cut={cut} origin={MASK_ORIGIN}>
    <KkPromoStage.PhotoWall
      photos={PROMO_PHOTOS}
      placeholderLabel={GALLERY_COPY.placeholder}
      left={735}
      top={78}
    />
    <KkPromoStage.Copy>
      <KkPromoStage.Kicker numeral="5" label={GALLERY_COPY.kicker} />
      <KkPromoStage.Headline line1={GALLERY_COPY.line1} line2={GALLERY_COPY.line2} size="display" />
      <KkPromoStage.Lead>{GALLERY_COPY.lead}</KkPromoStage.Lead>
    </KkPromoStage.Copy>
    <KkPromoStage.Device
      centerX={950}
      centerY={430}
      tilt={-7}
      turn={-14}
      depth={3}
      entry="bottom"
      delay={0.6}
    >
      <KkPromoStage.Phone image={screenOf('news')} title={SCREEN_TITLES.news} scale={0.46} />
    </KkPromoStage.Device>
  </KkPromoStage.Scene>
);
