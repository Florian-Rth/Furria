import FormatListNumberedRoundedIcon from '@mui/icons-material/FormatListNumberedRounded';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import StraightenRoundedIcon from '@mui/icons-material/StraightenRounded';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import ViewWeekOutlinedIcon from '@mui/icons-material/ViewWeekOutlined';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { STUDIO_G_WIDE } from '../../../KkStudioGDesk/internal/logic/studio-g-desk-queries';
import type { KkStudioGLaneKind } from '../logic/studio-g-lane-kinds';
import { laneVarOf } from '../logic/studio-g-lane-kinds';

const GLYPHS: Record<KkStudioGLaneKind, ReactNode> = {
  ruler: <StraightenRoundedIcon />,
  music: <GraphicEqRoundedIcon />,
  parts: <ViewWeekOutlinedIcon />,
  steps: <FormatListNumberedRoundedIcon />,
  videos: <VideocamOutlinedIcon />,
  movement: <RouteOutlinedIcon />,
};

interface KkStudioGTimelineHeadProps {
  kind: KkStudioGLaneKind;
  label: string;
}

export const KkStudioGTimelineHead: FC<KkStudioGTimelineHeadProps> = ({ kind, label }) => (
  <Stack
    direction="row"
    title={label}
    data-kk-studio-g-head={kind}
    sx={{
      height: `var(${laneVarOf(kind)})`,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0.75,
      px: 0.75,
      minWidth: 0,
      color: 'text.secondary',
      '& svg': { width: '1rem', height: '1rem', flexShrink: 0 },
      [STUDIO_G_WIDE]: {
        justifyContent: 'flex-start',
        px: 1.25,
      },
    }}
  >
    {GLYPHS[kind]}
    <Typography
      variant="caption"
      noWrap
      data-kk-studio-g-head-label
      sx={{ fontWeight: 800, color: 'inherit', lineHeight: 1 }}
    >
      {label}
    </Typography>
  </Stack>
);
