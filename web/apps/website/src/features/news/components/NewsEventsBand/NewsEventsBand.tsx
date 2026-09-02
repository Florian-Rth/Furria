import { KkBandSection, KkBandWatermark } from '@furria/ui';
import type { FC } from 'react';
import { NewsEventsCopy } from './internal/ui/NewsEventsCopy';
import { NewsEventsCta } from './internal/ui/NewsEventsCta';

export const NewsEventsBand: FC = () => (
  <KkBandSection decoration={<KkBandWatermark />}>
    <KkBandSection.Row>
      <NewsEventsCopy />
      <NewsEventsCta />
    </KkBandSection.Row>
  </KkBandSection>
);
