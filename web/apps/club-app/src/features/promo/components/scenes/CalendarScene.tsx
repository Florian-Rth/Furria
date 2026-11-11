import { KkPromoStage } from '@furria/ui/KkPromoStage';
import type { FC } from 'react';
import { CALENDAR_COPY, SCREEN_TITLES } from '../../promo-copy';
import { screenOf } from '../../promo-screens';
import { HERO_PHONE } from '../../reel-placements';
import type { ReelSceneProps } from '../../reel-scene-props';

export const CalendarScene: FC<ReelSceneProps> = ({ phase, cut }) => (
  <KkPromoStage.Scene phase={phase} cut={cut}>
    <KkPromoStage.Copy>
      <KkPromoStage.Kicker numeral="2" label={CALENDAR_COPY.kicker} />
      <KkPromoStage.Headline line1={CALENDAR_COPY.line1} line2={CALENDAR_COPY.line2} />
      <KkPromoStage.Lead>{CALENDAR_COPY.lead}</KkPromoStage.Lead>
    </KkPromoStage.Copy>
    <KkPromoStage.Device {...HERO_PHONE} delay={0}>
      <KkPromoStage.Phone image={screenOf('calendar')} title={SCREEN_TITLES.calendar} />
    </KkPromoStage.Device>
  </KkPromoStage.Scene>
);
