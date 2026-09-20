import type { FC } from 'react';
import { KkMeta } from '../../../KkMeta';
import type { KkSx } from '../../../kk-sx';

interface KkMottoStageCountdownProps {
  countdownLabel: string | null;
  sx?: KkSx;
}

export const KkMottoStageCountdown: FC<KkMottoStageCountdownProps> = ({ countdownLabel, sx }) => {
  if (countdownLabel === null) {
    return null;
  }

  return <KkMeta sx={sx}>{countdownLabel}</KkMeta>;
};
