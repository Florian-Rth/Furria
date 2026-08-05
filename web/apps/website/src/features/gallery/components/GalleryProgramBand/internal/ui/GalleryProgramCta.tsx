import type { FC } from 'react';
import { BandCta } from '@/components/BandCta';
import { galleryProgramBandContent } from '@/features/gallery/gallery-content';

export const GalleryProgramCta: FC = () => (
  <BandCta to={galleryProgramBandContent.ctaTo} emphasis="outlined">
    {galleryProgramBandContent.ctaLabel}
  </BandCta>
);
