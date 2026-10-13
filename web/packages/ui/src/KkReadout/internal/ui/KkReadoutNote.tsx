import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkStatusLevel } from '../../../internal/status-paint';
import { KkReadoutTick } from './KkReadoutTick';

interface KkReadoutNoteProps {
  text: string;
  level?: KkStatusLevel;
}

export const KkReadoutNote: FC<KkReadoutNoteProps> = ({ text, level }) => {
  const tick = level === undefined ? null : <KkReadoutTick level={level} />;

  return (
    <Stack
      direction="row"
      data-kk-readout-note
      sx={{ alignItems: 'center', columnGap: 0.75, minWidth: 0 }}
    >
      {tick}
      <Typography
        component="span"
        sx={{ typography: 'caption', fontWeight: 700, color: 'text.secondary' }}
      >
        {text}
      </Typography>
    </Stack>
  );
};
