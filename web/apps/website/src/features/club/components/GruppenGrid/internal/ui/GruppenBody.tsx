import type { FC } from 'react';
import type { PublicGroupsSource } from '../logic/use-public-groups-source';
import { GruppenEmpty } from './GruppenEmpty';
import { GruppenError } from './GruppenError';
import { GruppenGallery } from './GruppenGallery';
import { GruppenLoading } from './GruppenLoading';

interface GruppenBodyProps {
  source: PublicGroupsSource;
}

export const GruppenBody: FC<GruppenBodyProps> = ({ source }) => {
  if (source.status === 'loading') {
    return <GruppenLoading />;
  }

  if (source.status === 'error') {
    return <GruppenError onRetry={source.retry} />;
  }

  if (source.groups.length === 0) {
    return <GruppenEmpty />;
  }

  return <GruppenGallery groups={source.groups} />;
};
