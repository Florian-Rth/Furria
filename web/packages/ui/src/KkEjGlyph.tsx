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
import KeyboardDoubleArrowLeftRounded from '@mui/icons-material/KeyboardDoubleArrowLeftRounded';
import KeyboardDoubleArrowRightRounded from '@mui/icons-material/KeyboardDoubleArrowRightRounded';
import MoreHorizRounded from '@mui/icons-material/MoreHorizRounded';
import MusicNoteRounded from '@mui/icons-material/MusicNoteRounded';
import PauseRounded from '@mui/icons-material/PauseRounded';
import PersonOffRounded from '@mui/icons-material/PersonOffRounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
import PlaceRounded from '@mui/icons-material/PlaceRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import RadioButtonUncheckedRounded from '@mui/icons-material/RadioButtonUncheckedRounded';
import RedoRounded from '@mui/icons-material/RedoRounded';
import RepeatRounded from '@mui/icons-material/RepeatRounded';
import RouteRounded from '@mui/icons-material/RouteRounded';
import SelectAllRounded from '@mui/icons-material/SelectAllRounded';
import SkipNextRounded from '@mui/icons-material/SkipNextRounded';
import SkipPreviousRounded from '@mui/icons-material/SkipPreviousRounded';
import SplitscreenRounded from '@mui/icons-material/SplitscreenRounded';
import StraightRounded from '@mui/icons-material/StraightRounded';
import UndoRounded from '@mui/icons-material/UndoRounded';
import UnfoldLessRounded from '@mui/icons-material/UnfoldLessRounded';
import UnfoldMoreRounded from '@mui/icons-material/UnfoldMoreRounded';
import VideocamRounded from '@mui/icons-material/VideocamRounded';
import ViewWeekRounded from '@mui/icons-material/ViewWeekRounded';
import ZoomInRounded from '@mui/icons-material/ZoomInRounded';
import ZoomOutRounded from '@mui/icons-material/ZoomOutRounded';
import type { FC } from 'react';

export type KkEjGlyphName =
  | 'steps'
  | 'formation'
  | 'movement'
  | 'cast'
  | 'more'
  | 'line'
  | 'circle'
  | 'block'
  | 'mirror'
  | 'row'
  | 'column'
  | 'selectAll'
  | 'copy'
  | 'add'
  | 'shorter'
  | 'longer'
  | 'loop'
  | 'mark'
  | 'part'
  | 'delete'
  | 'dissolve'
  | 'straight'
  | 'earlier'
  | 'later'
  | 'waypoint'
  | 'person'
  | 'free'
  | 'spot'
  | 'history'
  | 'video'
  | 'music'
  | 'check'
  | 'close'
  | 'previous'
  | 'next'
  | 'play'
  | 'pause'
  | 'back'
  | 'forward'
  | 'undo'
  | 'redo'
  | 'zoomIn'
  | 'zoomOut'
  | 'fit';

const GLYPHS: Record<KkEjGlyphName, typeof AddRounded> = {
  steps: ViewWeekRounded,
  formation: GroupsRounded,
  movement: RouteRounded,
  cast: PersonRounded,
  more: MoreHorizRounded,
  line: HorizontalRuleRounded,
  circle: RadioButtonUncheckedRounded,
  block: GridViewRounded,
  mirror: FlipRounded,
  row: AlignVerticalCenterRounded,
  column: AlignHorizontalCenterRounded,
  selectAll: SelectAllRounded,
  copy: ContentCopyRounded,
  add: AddRounded,
  shorter: UnfoldLessRounded,
  longer: UnfoldMoreRounded,
  loop: RepeatRounded,
  mark: CallSplitRounded,
  part: SplitscreenRounded,
  delete: DeleteOutlineRounded,
  dissolve: CallSplitRounded,
  straight: StraightRounded,
  earlier: KeyboardDoubleArrowLeftRounded,
  later: KeyboardDoubleArrowRightRounded,
  waypoint: DiamondRounded,
  person: PersonRounded,
  free: PersonOffRounded,
  spot: PlaceRounded,
  history: HistoryRounded,
  video: VideocamRounded,
  music: MusicNoteRounded,
  check: CheckRounded,
  close: CloseRounded,
  previous: ChevronLeftRounded,
  next: ChevronRightRounded,
  play: PlayArrowRounded,
  pause: PauseRounded,
  back: SkipPreviousRounded,
  forward: SkipNextRounded,
  undo: UndoRounded,
  redo: RedoRounded,
  zoomIn: ZoomInRounded,
  zoomOut: ZoomOutRounded,
  fit: FitScreenRounded,
};

interface KkEjGlyphProps {
  name: KkEjGlyphName;
}

export const KkEjGlyph: FC<KkEjGlyphProps> = ({ name }) => {
  const Glyph = GLYPHS[name];

  return <Glyph aria-hidden fontSize="small" />;
};
