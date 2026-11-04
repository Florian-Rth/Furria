import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, ReactNode } from 'react';
import { focusRing } from './internal/focus-ring';
import { goldInkOf } from './internal/gold-ink';
import type { KkIconName } from './KkIcon';
import { KkIcon } from './KkIcon';
import { stepFigures, stepLabel } from './KkStatePill/state-paint';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export type KkLedgerTileTone = 'ink' | 'attention';

const tilePaint =
  (selected: boolean) =>
  (theme: Theme): CSSObject => {
    const palette = (theme.vars ?? theme).palette;

    return {
      width: '100%',
      height: '100%',
      flexDirection: 'column',
      alignItems: 'stretch',
      justifyContent: 'flex-start',
      textAlign: 'left',
      gap: 0.5,
      px: 1.5,
      py: 1.25,
      borderRadius: `${kkTokens.radius.base}px`,
      borderWidth: kkTokens.line.hair,
      borderStyle: 'solid',
      borderColor: selected ? palette.text.primary : palette.divider,
      backgroundColor: palette.background.paper,
      boxShadow: selected ? `inset 0 0 0 1px ${palette.text.primary}` : 'none',
      transition: 'border-color 160ms ease-out, box-shadow 160ms ease-out',
      ...focusRing(theme),
      '@media (hover: hover)': { '&:hover': { borderColor: palette.text.secondary } },
    };
  };

const toneInk =
  (tone: KkLedgerTileTone) =>
  (theme: Theme): CSSObject =>
    tone === 'attention' ? goldInkOf(theme) : { color: 'text.primary' };

interface KkLedgerTileProps {
  icon: KkIconName;
  label: string;
  figure: string;
  figureTone?: KkLedgerTileTone;
  note: string | null;
  noteTone?: KkLedgerTileTone;
  visual?: ReactNode;
  ariaLabel: string;
  selected: boolean;
  onSelect: () => void;
  sx?: KkSx;
}

export const KkLedgerTile: FC<KkLedgerTileProps> = ({
  icon,
  label,
  figure,
  figureTone = 'ink',
  note,
  noteTone = 'ink',
  visual,
  ariaLabel,
  selected,
  onSelect,
  sx,
}) => {
  const noteLine =
    note === null ? null : (
      <Box
        component="span"
        sx={[
          {
            ...stepFigures,
            typography: 'caption',
            fontWeight: noteTone === 'attention' ? 800 : 600,
            whiteSpace: 'nowrap',
          },
          noteTone === 'attention' ? toneInk('attention') : { color: 'text.secondary' },
        ]}
      >
        {note}
      </Box>
    );

  return (
    <ButtonBase
      aria-pressed={selected}
      aria-label={ariaLabel}
      onClick={onSelect}
      data-kk-ledger-tile
      sx={[tilePaint(selected), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, minWidth: 0 }}>
        <KkIcon name={icon} sx={{ width: '1rem', height: '1rem', color: 'text.secondary' }} />
        <Box component="span" sx={stepLabel}>
          {label}
        </Box>
      </Stack>
      <Stack direction="row" sx={{ alignItems: 'flex-end', gap: 1, minWidth: 0 }}>
        <Box
          component="span"
          sx={[
            { ...stepFigures, typography: 'h2', lineHeight: 1.05, whiteSpace: 'nowrap' },
            toneInk(figureTone),
          ]}
        >
          {figure}
        </Box>
        {visual}
      </Stack>
      {noteLine}
    </ButtonBase>
  );
};
