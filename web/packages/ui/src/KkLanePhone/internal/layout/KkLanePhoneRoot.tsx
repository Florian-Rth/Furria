import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { trackEdgeOf } from '../../../KkShell/internal/track-edge';

interface KkLanePhoneRootProps extends PropsWithChildren {
  label: string;
  narrow?: boolean;
}

export const KkLanePhoneRoot: FC<KkLanePhoneRootProps> = ({ label, narrow = false, children }) => (
  <Box
    component="section"
    aria-label={label}
    data-kk-lane-phone
    sx={{
      width: '100%',
      maxWidth: narrow ? '50rem' : 'none',
      mx: 'auto',
      minWidth: 0,
      height: `calc(100dvh - ${trackEdgeOf('top')} - ${trackEdgeOf('bottom')})`,
      containerType: 'size',
      containerName: 'kk-practice',
      contain: 'layout',
      display: 'grid',
      gridTemplateAreas: '"band" "head" "cards" "transport"',
      gridTemplateColumns: 'minmax(0, 1fr)',
      gridTemplateRows: 'auto auto minmax(0, 1fr) auto',
      rowGap: 0.75,
      userSelect: 'none',
      WebkitUserSelect: 'none',
      touchAction: 'manipulation',
    }}
  >
    {children}
  </Box>
);
