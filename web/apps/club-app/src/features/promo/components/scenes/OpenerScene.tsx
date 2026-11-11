import { KkPromoStage } from '@furria/ui/KkPromoStage';
import type { FC } from 'react';
import { OPENER_COPY, openerLineOf } from '../../promo-copy';
import { CREST_CENTER } from '../../reel-placements';
import type { ReelSceneProps } from '../../reel-scene-props';

const CREST_SIZE = 360;

export const OpenerScene: FC<ReelSceneProps> = ({ phase, cut, yearsLabel }) => (
  <KkPromoStage.Scene phase={phase} cut={cut}>
    <KkPromoStage.Device
      centerX={CREST_CENTER.x}
      centerY={CREST_CENTER.y}
      tilt={0}
      entry="left"
      delay={0}
    >
      <KkPromoStage.Crest size={CREST_SIZE} />
    </KkPromoStage.Device>
    <KkPromoStage.Copy left={500} top={250} width={730}>
      <KkPromoStage.Headline
        line1={openerLineOf(yearsLabel)}
        line2={OPENER_COPY.line2}
        size="display"
        delay={0.7}
      />
    </KkPromoStage.Copy>
  </KkPromoStage.Scene>
);
