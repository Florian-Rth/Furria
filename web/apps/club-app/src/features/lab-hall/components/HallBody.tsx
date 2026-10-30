import type { FC } from 'react';
import type { Studio, StudioTraining } from '@/features/acts/schemas';
import type { HallVariant } from '../hall-variants';
import { useHall } from '../hooks/use-hall';
import { HallBandBody } from './HallBandBody';
import { HallThumbsBody } from './HallThumbsBody';
import { HallWallBody } from './HallWallBody';

interface HallBodyProps {
  studio: Studio;
  actId: number;
  training: StudioTraining | null;
  variant: HallVariant;
}

export const HallBody: FC<HallBodyProps> = ({ studio, actId, training, variant }) => {
  const hall = useHall(studio, actId, training, variant.viewpoint);

  if (variant.layout === 'thumbs') {
    return <HallThumbsBody hall={hall} />;
  }
  if (variant.layout === 'band') {
    return <HallBandBody hall={hall} />;
  }

  return <HallWallBody hall={hall} />;
};
