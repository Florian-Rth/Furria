import { KkStageArea } from '@furria/ui/KkStageArea';
import type { KkSx } from '@furria/ui/kk-sx';
import type { FC } from 'react';
import { toStageAreaLabel } from '../club-record-labels';
import type { StageSize } from '../stage-metres';
import { formatStageSize } from '../stage-metres';

interface ClubStagePreviewProps {
  size: StageSize;
  artworkSvg: string | null;
  sx?: KkSx;
}

export const ClubStagePreview: FC<ClubStagePreviewProps> = ({ size, artworkSvg, sx }) => {
  const label = toStageAreaLabel(formatStageSize(size));

  return (
    <KkStageArea
      widthMetres={size.widthMetres}
      depthMetres={size.depthMetres}
      artworkSvg={artworkSvg}
      label={label}
      sx={sx}
    />
  );
};
