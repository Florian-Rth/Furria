import type { CSSObject, Theme } from '@mui/material/styles';
import { BOARD_INK } from '../../internal/status-paint';
import { kkTokens } from '../../tokens';

const { system, chrome } = kkTokens;

export const BOARD_STAGGER_SECONDS = system.rowStaggerSeconds;

export const boardFrame = (theme: Theme): CSSObject => ({
  minWidth: 0,
  rowGap: 1.5,
  px: { xs: 1.25, desktop: 2 },
  py: { xs: 1.25, desktop: 1.75 },
  color: BOARD_INK.ink,
  backgroundColor: chrome.dark.base,
  borderRadius: `${kkTokens.radius.base}px`,
  borderWidth: kkTokens.line.hair,
  borderStyle: 'solid',
  borderColor: chrome.dark.base,
  boxShadow: kkTokens.shadow.raised,
  ...theme.applyStyles('dark', {
    borderColor: (theme.vars ?? theme).palette.divider,
    boxShadow: 'none',
  }),
});

export const boardCell: CSSObject = {
  backgroundColor: kkTokens.color.dark.darkroom,
  borderBottomWidth: kkTokens.line.hair,
  borderBottomStyle: 'solid',
  borderBottomColor: kkTokens.color.dark.darkroomEdge,
  borderRadius: `${kkTokens.radius.bar}px`,
};

export const boardLabel = (theme: Theme): CSSObject => ({
  ...theme.typography.caption,
  fontWeight: 800,
  letterSpacing: kkTokens.type.tracking.label,
  textTransform: 'uppercase',
  lineHeight: 1.2,
  color: BOARD_INK.sub,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  minWidth: 0,
});

export const boardFocusRing: CSSObject = {
  '&:focus-visible': {
    outline: `${kkTokens.line.section}px solid`,
    outlineColor: BOARD_INK.attention,
    outlineOffset: 2,
  },
};
