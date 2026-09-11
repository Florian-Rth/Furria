import Dialog from '@mui/material/Dialog';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { raisedSurfaceScheme } from '../../../internal/raised-surface';
import { applyScheme } from '../../../internal/scheme-paint';
import { KkIconButton } from '../../../KkIconButton';
import { kkTokens } from '../../../tokens';

type KkModalFrameSize = 'default' | 'full';

const DIALOG_MARGIN = '32px';
const DIALOG_INSET = 'calc(100% - 64px)';
const SHEET_RADIUS = `${kkTokens.radius.sheet}px ${kkTokens.radius.sheet}px 0 0`;
const SCRIM_BLUR = 'blur(1.5px)';
const SHEET_FOOT = 2.5;
const DIALOG_FOOT = 2.75;

const dialogWidths: Record<KkModalFrameSize, number> = { default: 520, full: 560 };
const sheetHeights: Record<KkModalFrameSize, string> = { default: 'auto', full: '100dvh' };
const sheetMaxHeights: Record<KkModalFrameSize, string> = { default: '92dvh', full: '100dvh' };
const sheetRadii: Record<KkModalFrameSize, string> = { default: SHEET_RADIUS, full: '0' };

const scrim = (amount: string): string =>
  `color-mix(in srgb, ${kkTokens.overlay.scrimInk} ${amount}, transparent)`;

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
  (theme: Theme): CSSObject => {
    const desktop = theme.breakpoints.up('desktop');

    return {
      backgroundImage: 'none',
      borderStyle: 'solid',
      borderColor: 'divider',
      margin: '0px',
      width: '100%',
      maxWidth: '100%',
      height: sheetHeights[size],
      maxHeight: sheetMaxHeights[size],
      borderRadius: sheetRadii[size],
      paddingBottom: theme.spacing(SHEET_FOOT),
      ...applyScheme(theme, raisedSurfaceScheme, {
        light: {
          borderWidth: 0,
          boxShadow: kkTokens.shadow.sheetSoft,
          [desktop]: {
            margin: DIALOG_MARGIN,
            width: dialogWidths[size],
            maxWidth: DIALOG_INSET,
            height: 'auto',
            maxHeight: DIALOG_INSET,
            borderRadius: `${kkTokens.radius.base}px`,
            boxShadow: kkTokens.shadow.raised,
            paddingBottom: theme.spacing(DIALOG_FOOT),
          },
        },
        dark: {
          borderWidth: kkTokens.line.hair,
          boxShadow: kkTokens.shadow.sheet,
          [desktop]: { boxShadow: kkTokens.chrome.dark.lift },
        },
      }),
    };
  };

interface KkModalFrameRootProps extends PropsWithChildren {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  closeLabel: string;
  size?: KkModalFrameSize;
}

export const KkModalFrameRoot: FC<KkModalFrameRootProps> = ({
  open,
  onClose,
  labelledBy,
  closeLabel,
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
        minHeight: 0,
        flexGrow: 1,
        overflowY: 'auto',
        gap: 0.75,
        px: { xs: 2.5, desktop: 3.25 },
        pt: { xs: 1.75, desktop: 2.25 },
      }}
    >
      <Stack
        direction="row"
        data-kk-modal-frame-dismiss
        sx={{ justifyContent: 'flex-end', flexShrink: 0, mr: -1, mb: 0.25 }}
      >
        <KkIconButton
          label={closeLabel}
          icon="close"
          size="small"
          onClick={onClose}
          sx={{ color: 'text.secondary' }}
        />
      </Stack>
      {children}
    </Stack>
  </Dialog>
);
