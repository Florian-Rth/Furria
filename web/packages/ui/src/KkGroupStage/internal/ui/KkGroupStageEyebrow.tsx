import type { FC } from 'react';
import { KkEyebrow } from '../../../KkEyebrow';
import type { KkSx } from '../../../kk-sx';

interface KkGroupStageEyebrowProps {
  label: string | null;
  sx?: KkSx;
}

export const KkGroupStageEyebrow: FC<KkGroupStageEyebrowProps> = ({ label, sx }) => {
  if (label === null) {
    return null;
  }

  return (
    <KkEyebrow tone="onAccent" sx={sx}>
      {label}
    </KkEyebrow>
  );
};
