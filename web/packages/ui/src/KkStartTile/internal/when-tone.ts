import type { CSSObject, Theme } from '@mui/material/styles';
import { redInk } from '../../internal/red-ink';

export type KkStartTileWhenTone = 'live' | 'today' | 'plain';

export const whenInks: Record<KkStartTileWhenTone, (theme: Theme) => CSSObject> = {
  live: redInk,
  today: () => ({ color: 'text.primary' }),
  plain: () => ({ color: 'text.secondary' }),
};
