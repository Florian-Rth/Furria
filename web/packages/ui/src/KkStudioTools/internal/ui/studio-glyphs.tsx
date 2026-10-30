import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import RouteRoundedIcon from '@mui/icons-material/RouteRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import ViewWeekRoundedIcon from '@mui/icons-material/ViewWeekRounded';
import type { ReactNode } from 'react';

export type KkStudioToolGlyph = 'music' | 'steps' | 'formation' | 'movement' | 'video';

export const STUDIO_GLYPHS: Record<KkStudioToolGlyph, ReactNode> = {
  music: <MusicNoteRoundedIcon fontSize="small" />,
  steps: <ViewWeekRoundedIcon fontSize="small" />,
  formation: <GroupsRoundedIcon fontSize="small" />,
  movement: <RouteRoundedIcon fontSize="small" />,
  video: <VideocamRoundedIcon fontSize="small" />,
};
