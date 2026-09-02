import type { FC } from 'react';
import { BandCta } from '@/components/BandCta';
import { galleryEventsBandContent } from '@/features/gallery/gallery-content';

export const GalleryEventsCta: FC = () => (
  <BandCta to={galleryEventsBandContent.ctaTo} emphasis="outlined">
    {galleryEventsBandContent.ctaLabel}
  </BandCta>
);
