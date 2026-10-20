import Dialog from '@mui/material/Dialog';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { raisedSurface, raisedSurfaceScheme } from '../internal/raised-surface';
import { applyScheme } from '../internal/scheme-paint';
import { KkSheetHandle } from '../KkSheet/internal/ui/KkSheetHandle';
import { KkSheetRise } from '../KkSheet/internal/ui/KkSheetRise';
import { kkTokens } from '../tokens';

const DRAWER_RADIUS = `${kkTokens.radius.base}px ${kkTokens.radius.base}px 0 0`;
const DRAWER_MAX_HEIGHT = '92dvh';
const SCRIM_BLUR = 'blur(1.5px)';

const scrim = (amount: string): string =>
  `color-mix(in srgb, ${kkTokens.overlay.scrimInk} ${amount}, transparent)`;

const backdropStyles = (theme: Theme): CSSObject => ({
  backgroundColor: scrim('34%'),
  backdropFilter: SCRIM_BLUR,
  ...theme.applyStyles('dark', { backgroundColor: scrim('58%') }),
});

const paperStyles = (theme: Theme): CSSObject => ({
  backgroundImage: 'none',
  margin: '0px',
  width: '100%',
  maxWidth: '100%',
  maxHeight: DRAWER_MAX_HEIGHT,
  borderRadius: DRAWER_RADIUS,
  '& [data-kk-step-pane-foot]': raisedSurface(theme),
  ...applyScheme(theme, raisedSurfaceScheme, {
    light: { boxShadow: kkTokens.shadow.sheetSoft },
    dark: { boxShadow: kkTokens.shadow.sheet },
  }),
});

interface KkBottomDrawerProps extends PropsWithChildren {
  open: boolean;
  label: string;
  closeLabel: string;
  onClose: () => void;
}

export const KkBottomDrawer: FC<KkBottomDrawerProps> = ({
  open,
  label,
  closeLabel,
  onClose,
  children,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    aria-label={label}
    maxWidth={false}
    data-kk-bottom-drawer
    slots={{ transition: KkSheetRise }}
    slotProps={{
      container: { sx: { alignItems: 'flex-end' } },
      backdrop: { sx: backdropStyles },
      paper: { sx: paperStyles },
    }}
  >
    <KkSheetHandle label={closeLabel} onSelect={onClose} />
    {children}
  </Dialog>
);
