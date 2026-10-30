import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { KK_DARK_SCHEME_ATTRIBUTE } from '../../../theme';
import type { KkHallLayout } from '../hall-layouts';
import { HALL_LAYOUTS } from '../hall-layouts';

const SAFE_TOP = 'max(env(safe-area-inset-top), 0.75rem)';
const SAFE_RIGHT = 'max(env(safe-area-inset-right), 0.75rem)';
const SAFE_BOTTOM = 'max(env(safe-area-inset-bottom), 0.75rem)';
const SAFE_LEFT = 'max(env(safe-area-inset-left), 0.75rem)';

interface KkHallRootProps extends PropsWithChildren {
  label: string;
  layout: KkHallLayout;
}

export const KkHallRoot: FC<KkHallRootProps> = ({ label, layout, children }) => {
  const scheme = { [KK_DARK_SCHEME_ATTRIBUTE]: '' };

  return (
    <Box
      component="section"
      aria-label={label}
      data-kk-hall={layout}
      {...scheme}
      sx={(theme) => ({
        position: 'fixed',
        inset: 0,
        zIndex: theme.zIndex.modal,
        boxSizing: 'border-box',
        pt: SAFE_TOP,
        pr: SAFE_RIGHT,
        pb: SAFE_BOTTOM,
        pl: SAFE_LEFT,
        backgroundColor: (theme.vars ?? theme).palette.background.default,
        color: (theme.vars ?? theme).palette.text.primary,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'manipulation',
        overscrollBehavior: 'none',
      })}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          containerType: 'size',
          containerName: 'kk-hall',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            width: '100%',
            height: '100%',
            gap: { xs: 1.5, desktop: 2 },
            ...HALL_LAYOUTS[layout],
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};
