import { kkTokens } from '@furria/ui/tokens';
import GlobalStyles from '@mui/material/GlobalStyles';
import Stack from '@mui/material/Stack';
import type { Breakpoint, CSSObject, SxProps, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';

const SAFE_AREA_BOTTOM = 'env(safe-area-inset-bottom, 0px)';
const STICKY_ACTION_BAR_CLEARANCE = `calc(4.5rem + ${SAFE_AREA_BOTTOM})`;

interface StickyActionBarProps extends PropsWithChildren {
  hideFrom: Breakpoint;
  sx?: SxProps<Theme>;
}

const clearanceBelow =
  (hideFrom: Breakpoint) =>
  (theme: Theme): CSSObject => ({
    body: {
      paddingBottom: STICKY_ACTION_BAR_CLEARANCE,
      [theme.breakpoints.up(hideFrom)]: { paddingBottom: 0 },
    },
  });

export const StickyActionBar: FC<StickyActionBarProps> = ({ hideFrom, sx, children }) => {
  const reserveClearance = clearanceBelow(hideFrom);

  return (
    <>
      <GlobalStyles styles={reserveClearance} />
      <Stack
        direction="row"
        data-kk-sticky-action-bar
        sx={[
          (theme) => ({
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: theme.zIndex.appBar,
            display: { [hideFrom]: 'none' },
            alignItems: 'center',
            gap: 2,
            minHeight: STICKY_ACTION_BAR_CLEARANCE,
            px: kkTokens.layout.gutterX,
            py: 1.5,
            paddingBottom: `calc(${SAFE_AREA_BOTTOM} + 0.75rem)`,
            borderTop: kkTokens.line.hair,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: kkTokens.shadow.raised,
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {children}
      </Stack>
    </>
  );
};
