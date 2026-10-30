import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import type { KkStudioGLaneKind } from '../logic/studio-g-lane-kinds';
import { laneVarOf } from '../logic/studio-g-lane-kinds';

interface KkStudioGTimelineLaneProps extends PropsWithChildren {
  kind: KkStudioGLaneKind;
  label: string;
}

export const KkStudioGTimelineLane: FC<KkStudioGTimelineLaneProps> = ({
  kind,
  label,
  children,
}) => (
  <Box
    role="group"
    aria-label={label}
    data-kk-studio-g-lane={kind}
    sx={{ position: 'relative', height: `var(${laneVarOf(kind)})`, minWidth: 0 }}
  >
    {children}
  </Box>
);
