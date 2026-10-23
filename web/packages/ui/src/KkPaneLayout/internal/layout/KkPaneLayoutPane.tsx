import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { STICKY_HEAD_TOP } from '../../../KkStatePill/state-paint';
import { kkTokens } from '../../../tokens';

const { chromeGap, toolRowHeight, gutter } = kkTokens.shell;
const PANE_TOP = STICKY_HEAD_TOP + chromeGap + toolRowHeight;
const PANE_FOOT = gutter * 2 + 96;

interface KkPaneLayoutPaneProps extends PropsWithChildren {
  label: string;
}

export const KkPaneLayoutPane: FC<KkPaneLayoutPaneProps> = ({ label, children }) => (
  <Grid
    size={{ xs: 12, md: 5, lg: 4 }}
    component="aside"
    aria-label={label}
    data-kk-pane-layout-pane
    sx={{
      minWidth: 0,
      position: 'sticky',
      top: PANE_TOP,
      maxHeight: `calc(100dvh - ${PANE_TOP + PANE_FOOT}px)`,
      overflowY: 'auto',
      overscrollBehavior: 'contain',
      bgcolor: 'background.paper',
      borderWidth: kkTokens.line.hair,
      borderStyle: 'solid',
      borderColor: 'divider',
      borderRadius: `${kkTokens.radius.base}px`,
      boxShadow: kkTokens.shadow.rest,
    }}
  >
    <Stack sx={{ minWidth: 0 }}>{children}</Stack>
  </Grid>
);
