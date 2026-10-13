import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkStatusLevel } from '../../../internal/status-paint';
import { statusTick } from '../../../internal/status-paint';
import { kkTokens } from '../../../tokens';

const TICK_SIZE = 7;

interface KkReadoutTickProps {
  level: KkStatusLevel;
}

export const KkReadoutTick: FC<KkReadoutTickProps> = ({ level }) => (
  <Box
    component="span"
    aria-hidden
    data-kk-readout-tick={level}
    sx={(theme) => ({
      display: 'inline-block',
      width: TICK_SIZE,
      height: TICK_SIZE,
      flexShrink: 0,
      borderRadius: `${kkTokens.radius.bar / 2}px`,
      ...statusTick(theme, level),
    })}
  />
);
