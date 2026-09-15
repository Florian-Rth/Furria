import Dialog from '@mui/material/Dialog';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { raisedSurfaceScheme } from '../../../internal/raised-surface';
import { safeArea } from '../../../internal/safe-area';
import { applyScheme } from '../../../internal/scheme-paint';
import { kkTokens } from '../../../tokens';
import { useKkSheet } from '../../sheet-store';
import { KkSheetHandle } from '../ui/KkSheetHandle';
import { KkSheetRise } from '../ui/KkSheetRise';
import { KkSheetTitle } from '../ui/KkSheetTitle';

const SHEET_RADIUS = `${kkTokens.radius.base}px ${kkTokens.radius.base}px 0 0`;
const SHEET_MAX_HEIGHT = '92dvh';
const SHEET_FOOT = 20;
const SCRIM_BLUR = 'blur(1.5px)';
const TITLE_SUFFIX = '-title';

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
  maxHeight: SHEET_MAX_HEIGHT,
  borderRadius: SHEET_RADIUS,
  paddingBottom: safeArea('bottom', SHEET_FOOT),
  ...applyScheme(theme, raisedSurfaceScheme, {
    light: { boxShadow: kkTokens.shadow.sheetSoft },
    dark: { boxShadow: kkTokens.shadow.sheet },
  }),
});

interface KkSheetRootProps extends PropsWithChildren {
  id: string;
  title: string;
  closeLabel: string;
}

export const KkSheetRoot: FC<KkSheetRootProps> = ({ id, title, closeLabel, children }) => {
  const sheet = useKkSheet();
  const titleId = `${id}${TITLE_SUFFIX}`;

  return (
    <Dialog
      open={sheet.openSheetId === id}
      onClose={sheet.close}
      aria-labelledby={titleId}
      maxWidth={false}
      data-kk-sheet
      slots={{ transition: KkSheetRise }}
      slotProps={{
        container: { sx: { alignItems: 'flex-end' } },
        backdrop: { sx: backdropStyles },
        paper: { sx: paperStyles },
      }}
    >
      <KkSheetHandle label={closeLabel} onSelect={sheet.close} />
      <KkSheetTitle id={titleId}>{title}</KkSheetTitle>
      {children}
    </Dialog>
  );
};
