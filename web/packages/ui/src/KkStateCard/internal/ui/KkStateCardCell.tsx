import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import type { KkIconName } from '../../../KkIcon';
import { KkStateBadge } from '../../../KkStateBadge/KkStateBadge';
import { stepFigures, stepStateInk } from '../../../KkStatePill/state-paint';
import type { KkStepState } from '../../../KkStatePill/step-state';
import { kkTokens } from '../../../tokens';

const FACT_LINES = 2;

const cellPaint = (theme: Theme): CSSObject => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 0.5,
  minWidth: 0,
  minHeight: kkTokens.tapTarget,
  pt: 0.75,
  pb: 0.5,
  textAlign: 'center',
  borderRadius: `${kkTokens.radius.bar * 2}px`,
  ...focusRing(theme),
  '&:active': { backgroundColor: 'action.hover' },
  '@media (hover: hover)': { '&:hover': { backgroundColor: 'action.hover' } },
});

const factInk =
  (state: KkStepState) =>
  (theme: Theme): CSSObject => {
    if (state === 'overdue' || state === 'current') {
      return stepStateInk(theme, state);
    }

    return { color: state === 'done' ? 'text.primary' : 'text.secondary' };
  };

interface KkStateCardCellProps {
  icon: KkIconName;
  state: KkStepState;
  fact: string;
  ariaLabel: string;
  onSelect: () => void;
}

export const KkStateCardCell: FC<KkStateCardCellProps> = ({
  icon,
  state,
  fact,
  ariaLabel,
  onSelect,
}) => (
  <ButtonBase
    aria-label={ariaLabel}
    onClick={onSelect}
    data-kk-state-card-cell={state}
    sx={cellPaint}
  >
    <KkStateBadge icon={icon} state={state} />
    <Box
      component="span"
      aria-hidden
      sx={[
        {
          ...stepFigures,
          typography: 'caption',
          fontWeight: 700,
          lineHeight: 1.2,
          maxWidth: '100%',
          overflowWrap: 'anywhere',
          display: '-webkit-box',
          WebkitLineClamp: FACT_LINES,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        },
        factInk(state),
      ]}
    >
      {fact}
    </Box>
  </ButtonBase>
);
