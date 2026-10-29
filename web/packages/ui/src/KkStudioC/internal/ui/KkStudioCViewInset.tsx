import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

const INSET_WIDTH = '30%';
const INSET_GAP = 1;

const insetPaint =
  (ratio: number) =>
  (theme: Theme): CSSObject => ({
    position: 'absolute',
    top: theme.spacing(INSET_GAP),
    right: theme.spacing(INSET_GAP),
    zIndex: 1,
    width: INSET_WIDTH,
    aspectRatio: `${ratio}`,
    display: 'block',
    overflow: 'clip',
    borderRadius: `${kkTokens.radius.bar * 2}px`,
    borderWidth: kkTokens.line.section,
    borderStyle: 'solid',
    borderColor: (theme.vars ?? theme).palette.background.paper,
    boxShadow: kkTokens.shadow.floating,
    backgroundColor: (theme.vars ?? theme).palette.film.base,
    ...focusRing(theme),
  });

const tagPaint = (theme: Theme): CSSObject => ({
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(0.5),
  px: 0.75,
  py: 0.25,
  color: kkTokens.overlay.onPhotoText,
  backgroundColor: kkTokens.gallery.scrim,
});

interface KkStudioCViewInsetProps extends PropsWithChildren {
  ratio: number;
  caption: string;
  swapLabel: string;
  onSwap: () => void;
  sx?: KkSx;
}

export const KkStudioCViewInset: FC<KkStudioCViewInsetProps> = ({
  ratio,
  caption,
  swapLabel,
  onSwap,
  sx,
  children,
}) => (
  <ButtonBase
    aria-label={swapLabel}
    onClick={onSwap}
    data-kk-studio-c-inset
    sx={[insetPaint(ratio), ...(Array.isArray(sx) ? sx : [sx])]}
  >
    <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>{children}</Box>
    <Box component="span" sx={tagPaint}>
      <Typography
        component="span"
        sx={{ typography: 'caption', fontWeight: 800, lineHeight: 1.3, whiteSpace: 'nowrap' }}
      >
        {caption}
      </Typography>
      <SwapHorizRoundedIcon fontSize="small" />
    </Box>
  </ButtonBase>
);
