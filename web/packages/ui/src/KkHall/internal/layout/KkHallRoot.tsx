import Box from '@mui/material/Box';
import type { CSSObject } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { KK_DARK_SCHEME_ATTRIBUTE } from '../../../theme';
import { HALL_WIDE } from '../hall-query';

const SAFE_TOP = 'max(env(safe-area-inset-top), 0.75rem)';
const SAFE_RIGHT = 'max(env(safe-area-inset-right), 0.75rem)';
const SAFE_BOTTOM = 'max(env(safe-area-inset-bottom), 0.75rem)';
const SAFE_LEFT = 'max(env(safe-area-inset-left), 0.75rem)';

const WALL: CSSObject = {
  gridTemplateAreas: '"count" "step" "stage" "absent" "keys"',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gridTemplateRows: 'minmax(0, 22cqh) auto minmax(0, 1fr) auto auto',
  [HALL_WIDE]: {
    gridTemplateAreas: '"count stage" "step stage" "absent stage" "keys keys"',
    gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 3fr)',
    gridTemplateRows: 'minmax(0, 1fr) auto auto auto',
  },
};

interface KkHallRootProps extends PropsWithChildren {
  label: string;
}

export const KkHallRoot: FC<KkHallRootProps> = ({ label, children }) => {
  const scheme = { [KK_DARK_SCHEME_ATTRIBUTE]: '' };

  return (
    <Box
      component="section"
      aria-label={label}
      data-kk-hall
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
            ...WALL,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};
