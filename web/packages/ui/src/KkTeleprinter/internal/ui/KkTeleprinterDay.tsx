import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

interface KkTeleprinterDayProps {
  label: string;
}

export const KkTeleprinterDay: FC<KkTeleprinterDayProps> = ({ label }) => (
  <Stack
    component="li"
    direction="row"
    data-kk-teleprinter-day
    sx={{ alignItems: 'center', columnGap: 1, pt: 1.5, pb: 0.5, minWidth: 0 }}
  >
    <Typography
      component="span"
      variant="overline"
      sx={{
        fontFamily: kkTokens.font.display,
        fontWeight: kkTokens.font.displayWeight,
        letterSpacing: kkTokens.type.tracking.display,
        textTransform: 'uppercase',
        lineHeight: 1,
        color: 'text.secondary',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </Typography>
    <Stack
      component="span"
      aria-hidden
      sx={{ flexGrow: 1, height: kkTokens.line.hair, backgroundColor: 'divider' }}
    />
  </Stack>
);
