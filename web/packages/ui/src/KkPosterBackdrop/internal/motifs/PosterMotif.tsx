import type { FC } from 'react';
import type { PosterMotif as PosterMotifKind } from '../logic/poster-composition';
import type { MotifProps } from './motif-props';
import { PosterCandy } from './PosterCandy';
import { PosterConfetti } from './PosterConfetti';
import { PosterCouncilCap } from './PosterCouncilCap';
import { PosterEleven } from './PosterEleven';
import { PosterHerring } from './PosterHerring';
import { PosterJesterCap } from './PosterJesterCap';
import { PosterOrder } from './PosterOrder';
import { PosterStreamer } from './PosterStreamer';

const MOTIFS: Record<PosterMotifKind, FC<MotifProps>> = {
  eleven: PosterEleven,
  jesterCap: PosterJesterCap,
  councilCap: PosterCouncilCap,
  order: PosterOrder,
  streamer: PosterStreamer,
  candy: PosterCandy,
  confetti: PosterConfetti,
  herring: PosterHerring,
};

interface PosterMotifProps extends MotifProps {
  motif: PosterMotifKind;
}

export const PosterMotif: FC<PosterMotifProps> = ({ motif, plate, screen }) => {
  const Drawn = MOTIFS[motif];

  return <Drawn plate={plate} screen={screen} />;
};
