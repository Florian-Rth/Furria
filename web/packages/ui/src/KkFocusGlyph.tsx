import AddRounded from '@mui/icons-material/AddRounded';
import AlignHorizontalCenterRounded from '@mui/icons-material/AlignHorizontalCenterRounded';
import AlignVerticalCenterRounded from '@mui/icons-material/AlignVerticalCenterRounded';
import ChecklistRounded from '@mui/icons-material/ChecklistRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import DeselectRounded from '@mui/icons-material/DeselectRounded';
import FlipRounded from '@mui/icons-material/FlipRounded';
import GridViewRounded from '@mui/icons-material/GridViewRounded';
import GroupsRounded from '@mui/icons-material/GroupsRounded';
import HistoryRounded from '@mui/icons-material/HistoryRounded';
import LinearScaleRounded from '@mui/icons-material/LinearScaleRounded';
import MusicNoteRounded from '@mui/icons-material/MusicNoteRounded';
import PauseRounded from '@mui/icons-material/PauseRounded';
import PersonAddAlt1Rounded from '@mui/icons-material/PersonAddAlt1Rounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import RadioButtonUncheckedRounded from '@mui/icons-material/RadioButtonUncheckedRounded';
import RedoRounded from '@mui/icons-material/RedoRounded';
import RouteRounded from '@mui/icons-material/RouteRounded';
import SelectAllRounded from '@mui/icons-material/SelectAllRounded';
import SkipNextRounded from '@mui/icons-material/SkipNextRounded';
import SkipPreviousRounded from '@mui/icons-material/SkipPreviousRounded';
import UndoRounded from '@mui/icons-material/UndoRounded';
import VideocamRounded from '@mui/icons-material/VideocamRounded';
import ViewWeekRounded from '@mui/icons-material/ViewWeekRounded';
import ZoomInRounded from '@mui/icons-material/ZoomInRounded';
import ZoomOutRounded from '@mui/icons-material/ZoomOutRounded';
import type { FC } from 'react';

export type KkFocusGlyphName =
  | 'add'
  | 'alignAcross'
  | 'alignDeep'
  | 'check'
  | 'checklist'
  | 'copy'
  | 'remove'
  | 'deselect'
  | 'mirror'
  | 'block'
  | 'spots'
  | 'history'
  | 'distribute'
  | 'music'
  | 'pause'
  | 'addSpot'
  | 'play'
  | 'circle'
  | 'redo'
  | 'paths'
  | 'multi'
  | 'next'
  | 'previous'
  | 'undo'
  | 'video'
  | 'zoomIn'
  | 'zoomOut'
  | 'line'
  | 'steps';

const GLYPHS: Record<KkFocusGlyphName, typeof AddRounded> = {
  add: AddRounded,
  alignAcross: AlignHorizontalCenterRounded,
  alignDeep: AlignVerticalCenterRounded,
  check: CheckRounded,
  checklist: ChecklistRounded,
  copy: ContentCopyRounded,
  remove: DeleteOutlineRounded,
  deselect: DeselectRounded,
  mirror: FlipRounded,
  block: GridViewRounded,
  spots: GroupsRounded,
  history: HistoryRounded,
  distribute: LinearScaleRounded,
  music: MusicNoteRounded,
  pause: PauseRounded,
  addSpot: PersonAddAlt1Rounded,
  play: PlayArrowRounded,
  circle: RadioButtonUncheckedRounded,
  redo: RedoRounded,
  paths: RouteRounded,
  multi: SelectAllRounded,
  next: SkipNextRounded,
  previous: SkipPreviousRounded,
  undo: UndoRounded,
  video: VideocamRounded,
  zoomIn: ZoomInRounded,
  zoomOut: ZoomOutRounded,
  line: LinearScaleRounded,
  steps: ViewWeekRounded,
};

interface KkFocusGlyphProps {
  name: KkFocusGlyphName;
}

export const KkFocusGlyph: FC<KkFocusGlyphProps> = ({ name }) => {
  const Glyph = GLYPHS[name];

  return <Glyph aria-hidden fontSize="small" sx={{ flex: 'none' }} />;
};
