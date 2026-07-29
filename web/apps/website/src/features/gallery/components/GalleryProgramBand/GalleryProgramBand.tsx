import { KkBandSection } from '@furria/ui';
import type { FC } from 'react';
import { GalleryProgramCopy } from './internal/ui/GalleryProgramCopy';
import { GalleryProgramCta } from './internal/ui/GalleryProgramCta';
import { GalleryProgramWatermark } from './internal/ui/GalleryProgramWatermark';

export const GalleryProgramBand: FC = () => (
  <KkBandSection decoration={<GalleryProgramWatermark />}>
    <KkBandSection.Row>
      <GalleryProgramCopy />
      <GalleryProgramCta />
    </KkBandSection.Row>
  </KkBandSection>
);
