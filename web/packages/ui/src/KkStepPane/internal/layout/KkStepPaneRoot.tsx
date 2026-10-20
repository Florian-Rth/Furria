import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

const PANE_X = 2.5;

interface KkStepPaneRootProps extends PropsWithChildren {
  label: string;
  framed?: boolean;
  sx?: KkSx;
}

export const KkStepPaneRoot: FC<KkStepPaneRootProps> = ({ label, framed = true, sx, children }) => (
  <Stack
    component="section"
    aria-label={label}
    data-kk-step-pane
    sx={[
      {
        minWidth: 0,
        gap: 2,
        px: PANE_X,
        pt: framed ? 2 : 0.5,
        '& > [data-kk-step-pane-foot]': { mx: -PANE_X, px: PANE_X },
      },
      framed
        ? {
            bgcolor: 'background.paper',
            borderWidth: kkTokens.line.hair,
            borderStyle: 'solid',
            borderColor: 'divider',
            borderRadius: `${kkTokens.radius.base}px`,
            '& > [data-kk-step-pane-foot]': {
              borderBottomLeftRadius: `${kkTokens.radius.base}px`,
              borderBottomRightRadius: `${kkTokens.radius.base}px`,
            },
          }
        : {},
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
