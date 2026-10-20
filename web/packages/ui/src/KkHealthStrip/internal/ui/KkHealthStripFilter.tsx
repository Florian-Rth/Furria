import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { goldInkOf } from '../../../internal/gold-ink';
import { redInk } from '../../../internal/red-ink';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';
import { stepFigures } from '../../../KkStatePill/state-paint';
import { kkTokens } from '../../../tokens';

export type KkHealthFilterTone = 'ink' | 'overdue' | 'current';

const ICON_EXTENT = '1.125rem';
const CHIP_HEIGHT = '2.25rem';

const iconInk = (theme: Theme, tone: KkHealthFilterTone, quiet: boolean): CSSObject => {
  if (quiet) {
    return { color: 'text.disabled' };
  }

  switch (tone) {
    case 'overdue':
      return goldInkOf(theme);
    case 'current':
      return redInk(theme);
    case 'ink':
      return { color: 'text.primary' };
  }
};

const filterPaint =
  (tone: KkHealthFilterTone, quiet: boolean) =>
  (theme: Theme): CSSObject => ({
    position: 'relative',
    flexShrink: 0,
    gap: 0.75,
    minHeight: CHIP_HEIGHT,
    pl: 1,
    pr: 1.5,
    borderWidth: kkTokens.line.hair,
    borderStyle: 'solid',
    borderColor: 'divider',
    borderRadius: `${kkTokens.radius.pill}px`,
    typography: 'caption',
    fontWeight: 800,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    color: quiet ? 'text.disabled' : 'text.secondary',
    backgroundColor: 'transparent',
    transition: 'background-color 160ms ease-out, color 160ms ease-out',
    '& [data-kk-icon]': iconInk(theme, tone, quiet),
    '&::after': {
      content: '""',
      position: 'absolute',
      left: 0,
      right: 0,
      top: '50%',
      height: kkTokens.tapTarget,
      transform: 'translateY(-50%)',
    },
    ...focusRing(theme),
    '@media (hover: hover)': { '&:hover': { backgroundColor: 'action.hover' } },
    '&[aria-checked="true"]': {
      color: 'background.paper',
      backgroundColor: 'text.primary',
      borderColor: 'text.primary',
      '& [data-kk-icon]': { color: 'inherit' },
    },
  });

interface KkHealthStripFilterProps {
  icon: KkIconName;
  label: string;
  count: string | null;
  quietNote: string;
  ariaLabel: string;
  tone?: KkHealthFilterTone;
  selected: boolean;
  onSelect: () => void;
}

export const KkHealthStripFilter: FC<KkHealthStripFilterProps> = ({
  icon,
  label,
  count,
  quietNote,
  ariaLabel,
  tone = 'ink',
  selected,
  onSelect,
}) => {
  const quiet = count === null;
  const figure =
    count === null ? (
      <Box component="span" sx={{ fontWeight: 600 }}>
        {quietNote}
      </Box>
    ) : (
      <Box component="span" sx={{ ...stepFigures, color: selected ? 'inherit' : 'text.primary' }}>
        {count}
      </Box>
    );

  return (
    <ButtonBase
      role="radio"
      aria-checked={selected}
      aria-label={ariaLabel}
      disabled={quiet && !selected}
      onClick={onSelect}
      data-kk-health-filter
      sx={filterPaint(tone, quiet)}
    >
      <KkIcon name={icon} sx={{ width: ICON_EXTENT, height: ICON_EXTENT }} />
      <Box component="span">{label}</Box>
      {figure}
    </ButtonBase>
  );
};
