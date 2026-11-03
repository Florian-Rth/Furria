import type { Theme } from '@mui/material/styles';
import { kkTokens } from '../../tokens';

const { gutter, barHeight } = kkTokens.shell;

export const BAR_PADDING_X = 1.25;
export const TRACK_PADDING_X = 2.5;
const KEY_GAP = 1;

export const FOLDED_BAR_HEIGHT = `${barHeight}px`;

export const foldedBarRoomOf = (theme: Theme): string =>
  `calc(${kkTokens.tapTarget} + ${gutter + kkTokens.line.hair}px + ${theme.spacing(BAR_PADDING_X + KEY_GAP - TRACK_PADDING_X)})`;
