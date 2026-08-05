import { kkTokens } from '@furria/ui';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';

interface ApplyFormLegendProps extends PropsWithChildren {
  required?: boolean;
}

export const ApplyFormLegend: FC<ApplyFormLegendProps> = ({ required = false, children }) => {
  const marker = required ? (
    <Box component="span" aria-hidden sx={{ color: 'primary.main', ml: 0.75 }}>
      *
    </Box>
  ) : null;

  return (
    <Typography
      component="legend"
      variant="overline"
      data-kk-apply-legend
      sx={{ ...kkTokens.eyebrow, color: 'text.secondary', p: 0 }}
    >
      {children}
      {marker}
    </Typography>
  );
};
