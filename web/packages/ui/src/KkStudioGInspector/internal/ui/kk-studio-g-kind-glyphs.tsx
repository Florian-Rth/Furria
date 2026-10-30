import FormatListNumberedRoundedIcon from '@mui/icons-material/FormatListNumberedRounded';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import TheaterComedyOutlinedIcon from '@mui/icons-material/TheaterComedyOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import ViewWeekOutlinedIcon from '@mui/icons-material/ViewWeekOutlined';
import type { ReactNode } from 'react';

export type KkStudioGInspectorKind =
  | 'act'
  | 'song'
  | 'part'
  | 'step'
  | 'video'
  | 'spot'
  | 'spots'
  | 'keyframe';

export const KIND_GLYPHS: Record<KkStudioGInspectorKind, ReactNode> = {
  act: <TheaterComedyOutlinedIcon />,
  song: <GraphicEqRoundedIcon />,
  part: <ViewWeekOutlinedIcon />,
  step: <FormatListNumberedRoundedIcon />,
  video: <VideocamOutlinedIcon />,
  spot: <PersonOutlineRoundedIcon />,
  spots: <GroupsOutlinedIcon />,
  keyframe: <RouteOutlinedIcon />,
};
