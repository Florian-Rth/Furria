import { KkBandSection, KkBandWatermark } from '@furria/ui';
import type { FC } from 'react';
import { GalleryProgramCopy } from './internal/ui/GalleryProgramCopy';
import { GalleryProgramCta } from './internal/ui/GalleryProgramCta';

export const GalleryProgramBand: FC = () => (
  <KkBandSection decoration={<KkBandWatermark />}>
    <KkBandSection.Row>
      <GalleryProgramCopy />
      <GalleryProgramCta />
    </KkBandSection.Row>
  </KkBandSection>
);
