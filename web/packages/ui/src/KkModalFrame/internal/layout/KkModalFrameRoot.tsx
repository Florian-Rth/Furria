import Dialog from '@mui/material/Dialog';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { raisedSurface } from '../../../internal/raised-surface';
import { kkTokens } from '../../../tokens';

type KkModalFrameSize = 'default' | 'full';

const DIALOG_MARGIN = '32px';
const DIALOG_INSET = 'calc(100% - 64px)';
const SHEET_BASE_RADIUS = `${kkTokens.radius.base}px ${kkTokens.radius.base}px 0 0`;
const SCRIM_TINT = kkTokens.color.light.ink;
const SCRIM_BLUR = 'blur(1.5px)';

const dialogWidths: Record<KkModalFrameSize, number> = { default: 520, full: 560 };
const sheetHeights: Record<KkModalFrameSize, string> = { default: 'auto', full: '100dvh' };
const sheetMaxHeights: Record<KkModalFrameSize, string> = { default: '92dvh', full: '100dvh' };
const sheetRadii: Record<KkModalFrameSize, string> = { default: SHEET_BASE_RADIUS, full: '0' };

const scrim = (amount: string): string =>
  `color-mix(in srgb, ${SCRIM_TINT} ${amount}, transparent)`;

const backdropStyles = (theme: Theme): CSSObject => ({
  backgroundColor: scrim('34%'),
  [theme.breakpoints.up('desktop')]: {
    backgroundColor: scrim('42%'),
    backdropFilter: SCRIM_BLUR,
  },
  ...theme.applyStyles('dark', {
    backgroundColor: scrim('58%'),
    [theme.breakpoints.up('desktop')]: { backgroundColor: scrim('66%') },
  }),
});

const paperStyles =
  (size: KkModalFrameSize) =>
  (theme: Theme): CSSObject => ({
    ...raisedSurface(theme),
    backgroundImage: 'none',
    boxShadow: kkTokens.shadow.raised,
    margin: '0px',
    width: '100%',
    maxWidth: '100%',
    height: sheetHeights[size],
    maxHeight: sheetMaxHeights[size],
    borderRadius: sheetRadii[size],
    [theme.breakpoints.up('desktop')]: {
      margin: DIALOG_MARGIN,
      width: dialogWidths[size],
      maxWidth: DIALOG_INSET,
      height: 'auto',
      maxHeight: DIALOG_INSET,
      borderRadius: `${kkTokens.radius.base}px`,
    },
  });

interface KkModalFrameRootProps extends PropsWithChildren {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  size?: KkModalFrameSize;
}

export const KkModalFrameRoot: FC<KkModalFrameRootProps> = ({
  open,
  onClose,
  labelledBy,
  size = 'default',
  children,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    aria-labelledby={labelledBy}
    maxWidth={false}
    data-kk-modal-frame
    slotProps={{
      container: { sx: { alignItems: { xs: 'flex-end', desktop: 'center' } } },
      backdrop: { sx: backdropStyles },
      paper: { sx: paperStyles(size) },
    }}
  >
    <Stack
      data-kk-modal-frame-content
      sx={{
        minWidth: 0,
        gap: 0.75,
        px: { xs: 2.5, desktop: 3.25 },
        pt: { xs: 2.75, desktop: 3.25 },
        pb: { xs: 2.5, desktop: 2.75 },
      }}
    >
      {children}
    </Stack>
  </Dialog>
);
