import { kkTokens } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { MASTHEAD_HEIGHT_CSS_VAR } from '@/components/Masthead/masthead-height';

export const ApplyFormAside: FC<PropsWithChildren> = ({ children }) => (
  <Grid
    size={{ xs: 12, desktop: 5 }}
    data-kk-apply-aside
    sx={(theme) => ({
      position: { desktop: 'sticky' },
      top: {
        desktop: `calc(var(${MASTHEAD_HEIGHT_CSS_VAR}, 0px) + ${theme.spacing(kkTokens.layout.mastheadClearance)})`,
      },
    })}
  >
    <Stack sx={{ gap: kkTokens.layout.fieldGap }}>{children}</Stack>
  </Grid>
);
