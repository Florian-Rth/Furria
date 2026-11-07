import type { CSSObject, Theme } from '@mui/material/styles';
import { kkTokens } from '../../tokens';

export const FULLSCREEN_ACTIVE = '&[data-kk-fullscreen="true"]';

export const fullscreenPaint = (theme: Theme): CSSObject => ({
  [FULLSCREEN_ACTIVE]: {
    position: 'fixed',
    inset: 0,
    zIndex: theme.zIndex.modal,
    width: '100%',
    height: '100%',
    maxWidth: 'none',
    maxHeight: 'none',
    aspectRatio: 'auto',
    margin: 0,
    borderRadius: 0,
    padding: 0,
    border: 0,
    overflow: 'clip',
    backgroundColor: kkTokens.overlay.scrimInk,
  },
  '&[popover]': { color: kkTokens.overlay.onPhotoText },
});
