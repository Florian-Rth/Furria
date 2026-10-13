import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkStatusLevel } from '../../../internal/status-paint';
import { KkFlapCount } from '../../../KkFlapCount';
import { kkTokens } from '../../../tokens';
import { KkReadoutTick } from './KkReadoutTick';

interface KkReadoutFactProps {
  label: string;
  value: string;
  level?: KkStatusLevel;
}

export const KkReadoutFact: FC<KkReadoutFactProps> = ({ label, value, level }) => {
  const tick = level === undefined ? null : <KkReadoutTick level={level} />;

  return (
    <Stack data-kk-readout-fact sx={{ rowGap: 0.25, minWidth: 0 }}>
      <Stack
        component="dt"
        direction="row"
        sx={{ alignItems: 'center', columnGap: 0.75, minWidth: 0 }}
      >
        {tick}
        <Typography
          component="span"
          sx={{
            typography: 'caption',
            fontWeight: 800,
            letterSpacing: kkTokens.type.tracking.tight,
            color: 'text.secondary',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {label}
        </Typography>
      </Stack>
      <Typography component="dd" sx={{ m: 0, minWidth: 0 }}>
        <KkFlapCount value={value} variant="h3" />
      </Typography>
    </Stack>
  );
};
