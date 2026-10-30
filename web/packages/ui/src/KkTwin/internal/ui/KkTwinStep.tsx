import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { lineClamp } from '../../../internal/line-clamp';
import { TWIN_OPEN, TWIN_TIGHT, TWIN_WIDE } from '../twin-query';
import { KkTwinFade } from './KkTwinFade';

const BAND_LINE = '2.25rem';
const COLUMN_LINE = '1.75rem';
const COLUMN_LINES = 2;

interface KkTwinStepProps {
  stepKey: string;
  name: string;
}

export const KkTwinStep: FC<KkTwinStepProps> = ({ stepKey, name }) => (
  <Box
    sx={{
      width: '100%',
      height: BAND_LINE,
      minWidth: 0,
      [TWIN_WIDE]: { height: `calc(${COLUMN_LINE} * ${COLUMN_LINES})` },
      [TWIN_OPEN]: { height: BAND_LINE },
      [TWIN_TIGHT]: { height: COLUMN_LINE },
    }}
  >
    <KkTwinFade fadeKey={stepKey}>
      <Typography
        component="h2"
        aria-live="polite"
        data-kk-twin-step
        sx={{
          typography: 'h1',
          lineHeight: BAND_LINE,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minWidth: 0,
          [TWIN_WIDE]: {
            typography: 'h2',
            lineHeight: COLUMN_LINE,
            whiteSpace: 'normal',
            alignSelf: 'end',
            ...lineClamp(COLUMN_LINES),
          },
          [TWIN_OPEN]: {
            typography: 'h1',
            lineHeight: BAND_LINE,
            whiteSpace: 'nowrap',
            display: 'block',
            alignSelf: 'center',
          },
          [TWIN_TIGHT]: { typography: 'h2', lineHeight: COLUMN_LINE },
        }}
      >
        {name}
      </Typography>
    </KkTwinFade>
  </Box>
);
