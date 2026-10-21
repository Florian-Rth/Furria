import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { goldInkOf } from '../../../internal/gold-ink';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';
import { stepFigures } from '../../../KkStatePill/state-paint';
import { kkTokens } from '../../../tokens';

export type KkTallyTone = 'ink' | 'attention';

const ICON_EXTENT = '1.125rem';
const QUIET_MARK = '–';

const iconInk = (theme: Theme, tone: KkTallyTone, quiet: boolean): CSSObject => {
  if (quiet) {
    return { color: 'text.disabled' };
  }

  return tone === 'attention' ? goldInkOf(theme) : { color: 'text.primary' };
};

const counterPaint =
  (tone: KkTallyTone, quiet: boolean) =>
  (theme: Theme): CSSObject => ({
    position: 'relative',
    flexShrink: 0,
    gap: 0.625,
    minHeight: '2.25rem',
    minWidth: kkTokens.tapTarget,
    px: 1,
    borderRadius: `${kkTokens.radius.pill}px`,
    typography: 'caption',
    fontWeight: 700,
    whiteSpace: 'nowrap',
    color: quiet ? 'text.disabled' : 'text.secondary',
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
      '& [data-kk-icon], & [data-kk-tally-figure]': { color: 'inherit' },
    },
  });

interface KkTallyStripCounterProps {
  icon: KkIconName;
  label: string;
  count: number;
  ariaLabel: string;
  tone?: KkTallyTone;
  selected: boolean;
  onSelect: () => void;
}

export const KkTallyStripCounter: FC<KkTallyStripCounterProps> = ({
  icon,
  label,
  count,
  ariaLabel,
  tone = 'ink',
  selected,
  onSelect,
}) => {
  const quiet = count === 0;
  const figure = quiet ? QUIET_MARK : String(count);

  return (
    <ButtonBase
      role="radio"
      aria-checked={selected}
      aria-label={ariaLabel}
      disabled={quiet && !selected}
      onClick={onSelect}
      data-kk-tally-counter
      sx={counterPaint(tone, quiet)}
    >
      <KkIcon name={icon} sx={{ width: ICON_EXTENT, height: ICON_EXTENT }} />
      <Box
        component="span"
        data-kk-tally-figure
        sx={{
          ...stepFigures,
          typography: 'h4',
          lineHeight: 1,
          color: quiet ? 'inherit' : 'text.primary',
        }}
      >
        {figure}
      </Box>
      <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
        {label}
      </Box>
    </ButtonBase>
  );
};
