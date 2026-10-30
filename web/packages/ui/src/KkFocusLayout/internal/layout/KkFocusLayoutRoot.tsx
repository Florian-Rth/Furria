import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { trackEdgeOf } from '../../../KkShell/internal/track-edge';
import { KK_FOCUS_DESK_QUERY } from '../../use-focus-desk';

export type KkFocusLayoutKind = 'editor' | 'page';

interface KkFocusLayoutRootProps extends PropsWithChildren {
  label: string;
  kind: KkFocusLayoutKind;
}

const DESK = `@media ${KK_FOCUS_DESK_QUERY}`;

export const KkFocusLayoutRoot: FC<KkFocusLayoutRootProps> = ({ label, kind, children }) => (
  <Box
    component="section"
    aria-label={label}
    data-kk-focus={kind}
    sx={{
      width: '100%',
      minWidth: 0,
      height: `calc(100dvh - ${trackEdgeOf('top')} - ${trackEdgeOf('bottom')})`,
      containerType: 'size',
      containerName: 'kk-focus',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      touchAction: 'manipulation',
      display: 'grid',
      gridTemplateAreas: '"band" "top" "stage" "strip"',
      gridTemplateColumns: 'minmax(0, 1fr)',
      gridTemplateRows: 'auto auto minmax(0, 1fr) auto',
      rowGap: 1,
      '&[data-kk-focus="page"]': {
        maxWidth: '48rem',
        mx: 'auto',
        gridTemplateRows: 'auto auto minmax(7rem, 28cqh) minmax(0, 1fr)',
      },
      [DESK]: {
        '&[data-kk-focus="editor"]': {
          gridTemplateAreas: '"band band" "top top" "outline stage" "outline time"',
          gridTemplateColumns: 'minmax(0, min(16rem, 24vw)) minmax(0, 1fr)',
          gridTemplateRows: 'auto auto minmax(8rem, 1fr) auto',
          columnGap: 1.5,
        },
      },
    }}
  >
    {children}
  </Box>
);
