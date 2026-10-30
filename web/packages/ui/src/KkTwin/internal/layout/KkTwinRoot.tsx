import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { TWIN_CONTAINER, TWIN_GAP, TWIN_TIGHT, TWIN_TIGHT_GAP } from '../twin-query';

const SAFE_TOP = 'max(env(safe-area-inset-top), 0.75rem)';
const SAFE_RIGHT = 'max(env(safe-area-inset-right), 0.75rem)';
const SAFE_BOTTOM = 'max(env(safe-area-inset-bottom), 0.75rem)';
const SAFE_LEFT = 'max(env(safe-area-inset-left), 0.75rem)';
const WIDEST = '100rem';

interface KkTwinRootProps extends PropsWithChildren {
  label: string;
}

export const KkTwinRoot: FC<KkTwinRootProps> = ({ label, children }) => (
  <Box
    component="section"
    aria-label={label}
    data-kk-twin
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
        maxWidth: WIDEST,
        height: '100%',
        mx: 'auto',
        containerType: 'size',
        containerName: TWIN_CONTAINER,
      }}
    >
      <Box
        sx={{
          display: 'grid',
          width: '100%',
          height: '100%',
          gridTemplateAreas: '"head" "pair" "dock"',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gridTemplateRows: 'auto minmax(0, 1fr) auto',
          rowGap: TWIN_GAP,
          [TWIN_TIGHT]: { rowGap: TWIN_TIGHT_GAP },
        }}
      >
        {children}
      </Box>
    </Box>
  </Box>
);
