import { kkTokens } from '@furria/ui';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';

interface SiteFormLegendProps extends PropsWithChildren {
  required?: boolean;
}

export const SiteFormLegend: FC<SiteFormLegendProps> = ({ required = false, children }) => {
  const marker = required ? (
    <Box component="span" aria-hidden sx={{ color: 'primary.main', ml: 0.75 }}>
      *
    </Box>
  ) : null;

  return (
    <Typography
      component="legend"
      variant="overline"
      data-kk-site-form-legend
      sx={{ ...kkTokens.eyebrow, color: 'text.secondary', p: 0 }}
    >
      {children}
      {marker}
    </Typography>
  );
};
