import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import AlignHorizontalCenterRoundedIcon from '@mui/icons-material/AlignHorizontalCenterRounded';
import AlignVerticalCenterRoundedIcon from '@mui/icons-material/AlignVerticalCenterRounded';
import AppsRoundedIcon from '@mui/icons-material/AppsRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import FlipRoundedIcon from '@mui/icons-material/FlipRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import HorizontalRuleRoundedIcon from '@mui/icons-material/HorizontalRuleRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import MovieRoundedIcon from '@mui/icons-material/MovieRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import PanoramaFishEyeRoundedIcon from '@mui/icons-material/PanoramaFishEyeRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import PlaylistAddRoundedIcon from '@mui/icons-material/PlaylistAddRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import RedoRoundedIcon from '@mui/icons-material/RedoRounded';
import RouteRoundedIcon from '@mui/icons-material/RouteRounded';
import SelectAllRoundedIcon from '@mui/icons-material/SelectAllRounded';
import TableRowsRoundedIcon from '@mui/icons-material/TableRowsRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import type { FC } from 'react';

export type KkEightsGlyphName =
  | 'line'
  | 'block'
  | 'circle'
  | 'mirror'
  | 'alignRow'
  | 'alignColumn'
  | 'spread'
  | 'copy'
  | 'multi'
  | 'addSpot'
  | 'onion'
  | 'formation'
  | 'ways'
  | 'undo'
  | 'redo'
  | 'history'
  | 'music'
  | 'video'
  | 'markStep'
  | 'remove'
  | 'done'
  | 'open'
  | 'waiting'
  | 'locked'
  | 'spots'
  | 'sheet';

const GLYPHS: Record<KkEightsGlyphName, FC<SvgIconProps>> = {
  line: HorizontalRuleRoundedIcon,
  block: AppsRoundedIcon,
  circle: PanoramaFishEyeRoundedIcon,
  mirror: FlipRoundedIcon,
  alignRow: AlignVerticalCenterRoundedIcon,
  alignColumn: AlignHorizontalCenterRoundedIcon,
  spread: TableRowsRoundedIcon,
  copy: ContentCopyRoundedIcon,
  multi: SelectAllRoundedIcon,
  addSpot: AddCircleOutlineRoundedIcon,
  onion: LayersRoundedIcon,
  formation: GroupsRoundedIcon,
  ways: RouteRoundedIcon,
  undo: UndoRoundedIcon,
  redo: RedoRoundedIcon,
  history: HistoryRoundedIcon,
  music: MusicNoteRoundedIcon,
  video: MovieRoundedIcon,
  markStep: PlaylistAddRoundedIcon,
  remove: DeleteOutlineRoundedIcon,
  done: CheckRoundedIcon,
  open: RadioButtonUncheckedRoundedIcon,
  waiting: HourglassEmptyRoundedIcon,
  locked: LockRoundedIcon,
  spots: PlaceRoundedIcon,
  sheet: TableRowsRoundedIcon,
};

interface KkEightsGlyphProps {
  name: KkEightsGlyphName;
}

export const KkEightsGlyph: FC<KkEightsGlyphProps> = ({ name }) => {
  const Glyph = GLYPHS[name];

  return <Glyph aria-hidden fontSize="small" />;
};
