import AddRounded from '@mui/icons-material/AddRounded';
import AlignHorizontalCenterRounded from '@mui/icons-material/AlignHorizontalCenterRounded';
import AlignVerticalCenterRounded from '@mui/icons-material/AlignVerticalCenterRounded';

import CallSplitRounded from '@mui/icons-material/CallSplitRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import DiamondRounded from '@mui/icons-material/DiamondRounded';
import FitScreenRounded from '@mui/icons-material/FitScreenRounded';
import FlipRounded from '@mui/icons-material/FlipRounded';
import GridViewRounded from '@mui/icons-material/GridViewRounded';
import GroupsRounded from '@mui/icons-material/GroupsRounded';
import HistoryRounded from '@mui/icons-material/HistoryRounded';
import HorizontalRuleRounded from '@mui/icons-material/HorizontalRuleRounded';
import LibraryMusicRounded from '@mui/icons-material/LibraryMusicRounded';
import MusicNoteRounded from '@mui/icons-material/MusicNoteRounded';
import PauseRounded from '@mui/icons-material/PauseRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import RadioButtonUncheckedRounded from '@mui/icons-material/RadioButtonUncheckedRounded';
import RedoRounded from '@mui/icons-material/RedoRounded';
import RemoveRounded from '@mui/icons-material/RemoveRounded';
import RouteRounded from '@mui/icons-material/RouteRounded';
import SegmentRounded from '@mui/icons-material/SegmentRounded';
import SkipNextRounded from '@mui/icons-material/SkipNextRounded';
import SkipPreviousRounded from '@mui/icons-material/SkipPreviousRounded';
import SplitscreenRounded from '@mui/icons-material/SplitscreenRounded';
import UndoRounded from '@mui/icons-material/UndoRounded';
import VideocamRounded from '@mui/icons-material/VideocamRounded';
import ViewWeekRounded from '@mui/icons-material/ViewWeekRounded';
import ZoomInRounded from '@mui/icons-material/ZoomInRounded';
import ZoomOutRounded from '@mui/icons-material/ZoomOutRounded';
import type { FC } from 'react';

export type KkLaneGlyphName =
  | 'play'
  | 'pause'
  | 'back'
  | 'forward'
  | 'undo'
  | 'redo'
  | 'zoomIn'
  | 'zoomOut'
  | 'fit'
  | 'music'
  | 'video'
  | 'steps'
  | 'parts'
  | 'spots'
  | 'formation'
  | 'paths'
  | 'final'
  | 'key'
  | 'check'
  | 'mirror'
  | 'line'
  | 'circle'
  | 'block'
  | 'alignAcross'
  | 'alignDeep'
  | 'distribute'
  | 'copy'
  | 'add'
  | 'remove'
  | 'delete'
  | 'dissolve'
  | 'history'
  | 'close'
  | 'left'
  | 'right';

const GLYPHS: Record<KkLaneGlyphName, typeof AddRounded> = {
  play: PlayArrowRounded,
  pause: PauseRounded,
  back: SkipPreviousRounded,
  forward: SkipNextRounded,
  undo: UndoRounded,
  redo: RedoRounded,
  zoomIn: ZoomInRounded,
  zoomOut: ZoomOutRounded,
  fit: FitScreenRounded,
  music: MusicNoteRounded,
  video: VideocamRounded,
  steps: ViewWeekRounded,
  parts: SplitscreenRounded,
  spots: PersonAddRounded,
  formation: GroupsRounded,
  paths: RouteRounded,
  final: LibraryMusicRounded,
  key: DiamondRounded,
  check: CheckRounded,
  mirror: FlipRounded,
  line: HorizontalRuleRounded,
  circle: RadioButtonUncheckedRounded,
  block: GridViewRounded,
  alignAcross: AlignHorizontalCenterRounded,
  alignDeep: AlignVerticalCenterRounded,
  distribute: SegmentRounded,
  copy: ContentCopyRounded,
  add: AddRounded,
  remove: RemoveRounded,
  delete: DeleteOutlineRounded,
  dissolve: CallSplitRounded,
  history: HistoryRounded,
  close: CloseRounded,
  left: ChevronLeftRounded,
  right: ChevronRightRounded,
};

interface KkLaneGlyphProps {
  name: KkLaneGlyphName;
}

export const KkLaneGlyph: FC<KkLaneGlyphProps> = ({ name }) => {
  const Glyph = GLYPHS[name];

  return <Glyph aria-hidden fontSize="small" />;
};
