import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import type { KkIconName } from '../../../KkIcon';
import { KkStateBadge } from '../../../KkStateBadge/KkStateBadge';
import { stepFigures, stepStateInk } from '../../../KkStatePill/state-paint';
import type { KkStepState } from '../../../KkStatePill/step-state';
import { kkTokens } from '../../../tokens';

const FACT_LINES = 2;

const cellPaint =
  (selected: boolean, compact: boolean) =>
  (theme: Theme): CSSObject => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: compact ? 'center' : 'flex-start',
    gap: 1,
    minWidth: 0,
    width: '100%',
    height: '100%',
    minHeight: kkTokens.tapTarget,
    px: compact ? 0 : 0.5,
    py: 0.75,
    textAlign: 'left',
    borderRadius: `${kkTokens.radius.bar * 2}px`,
    outlineWidth: kkTokens.line.hair,
    outlineStyle: 'solid',
    outlineColor: selected && !compact ? (theme.vars ?? theme).palette.text.primary : 'transparent',
    outlineOffset: -kkTokens.line.hair,
    backgroundColor: selected && !compact ? 'background.paper' : 'transparent',
    transition: 'background-color 160ms ease-out, outline-color 160ms ease-out',
    ...focusRing(theme),
    '@media (hover: hover)': {
      '&:hover': compact
        ? {
            '& [data-kk-state-badge] > span:first-of-type': {
              outlineColor: (theme.vars ?? theme).palette.divider,
            },
          }
        : {
            backgroundColor: 'background.paper',
            outlineColor: (theme.vars ?? theme).palette.divider,
          },
    },
  });

const factInk =
  (state: KkStepState) =>
  (theme: Theme): CSSObject => {
    if (state === 'overdue' || state === 'current') {
      return stepStateInk(theme, state);
    }

    return { color: state === 'done' ? 'text.primary' : 'text.secondary' };
  };

interface KkStateGridCellProps {
  icon: KkIconName;
  state: KkStepState;
  fact: string;
  label: string;
  selected?: boolean;
  compact?: boolean;
  onSelect: () => void;
}

export const KkStateGridCell: FC<KkStateGridCellProps> = ({
  icon,
  state,
  fact,
  label,
  selected = false,
  compact = false,
  onSelect,
}) => {
  const factLine = compact ? null : (
    <Box
      component="span"
      aria-hidden
      sx={[
        {
          ...stepFigures,
          typography: 'caption',
          fontWeight: 700,
          lineHeight: 1.25,
          minWidth: 0,
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
  );
  const button = (
    <ButtonBase
      aria-label={label}
      aria-pressed={selected}
      onClick={onSelect}
      data-kk-state-grid-cell={state}
      sx={cellPaint(selected, compact)}
    >
      <KkStateBadge icon={icon} state={state} selected={selected && compact} />
      {factLine}
    </ButtonBase>
  );
  const shown = compact ? (
    <Tooltip title={label} placement="top">
      {button}
    </Tooltip>
  ) : (
    button
  );

  return (
    <Stack role="cell" sx={{ minWidth: 0, alignSelf: 'stretch' }}>
      {shown}
    </Stack>
  );
};
