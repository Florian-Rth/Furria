import { KkBandSection, KkBandWatermark } from '@furria/ui';
import type { FC } from 'react';
import { GalleryEventsCopy } from './internal/ui/GalleryEventsCopy';
import { GalleryEventsCta } from './internal/ui/GalleryEventsCta';

export const GalleryEventsBand: FC = () => (
  <KkBandSection decoration={<KkBandWatermark />}>
    <KkBandSection.Row>
      <GalleryEventsCopy />
      <GalleryEventsCta />
    </KkBandSection.Row>
  </KkBandSection>
);
