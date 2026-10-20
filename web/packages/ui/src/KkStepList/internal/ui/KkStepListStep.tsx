import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';
import { KkStateBadge } from '../../../KkStateBadge/KkStateBadge';
import { KkStatePill } from '../../../KkStatePill/KkStatePill';
import { stepFigures, stepStateInk } from '../../../KkStatePill/state-paint';
import type { KkStepState } from '../../../KkStatePill/step-state';
import { kkTokens } from '../../../tokens';

const SELECTED_EDGE = kkTokens.line.page;

const stepPaint =
  (selected: boolean) =>
  (theme: Theme): CSSObject => ({
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr) auto',
    alignItems: 'center',
    columnGap: 1.25,
    width: '100%',
    minWidth: 0,
    minHeight: kkTokens.tapTarget,
    px: 1.5,
    py: 1,
    textAlign: 'left',
    position: 'relative',
    backgroundColor: selected ? 'action.selected' : 'transparent',
    transition: 'background-color 160ms ease-out',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: SELECTED_EDGE,
      backgroundColor: selected ? (theme.vars ?? theme).palette.text.primary : 'transparent',
    },
    ...focusRing(theme),
    '@media (hover: hover)': { '&:hover': { backgroundColor: 'action.hover' } },
  });

interface KkStepListStepProps {
  icon: KkIconName;
  title: string;
  state: KkStepState;
  stateLabel: string;
  fact: string;
  due?: string;
  selected?: boolean;
  onSelect: () => void;
}

export const KkStepListStep: FC<KkStepListStepProps> = ({
  icon,
  title,
  state,
  stateLabel,
  fact,
  due,
  selected = false,
  onSelect,
}) => {
  const dueLine =
    due === undefined ? null : (
      <Box
        component="span"
        sx={[
          (theme) => ({
            ...stepFigures,
            typography: 'caption',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            ...(state === 'overdue' ? stepStateInk(theme, state) : { color: 'text.secondary' }),
          }),
        ]}
      >
        {due}
      </Box>
    );

  return (
    <ButtonBase
      aria-current={selected ? 'step' : undefined}
      onClick={onSelect}
      data-kk-step-list-step={state}
      sx={stepPaint(selected)}
    >
      <KkStateBadge icon={icon} state={state} selected={selected} />
      <Stack sx={{ minWidth: 0, gap: 0.375 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25, minWidth: 0 }}>
          <Typography
            component="span"
            variant="body2"
            noWrap
            sx={{ fontWeight: 800, lineHeight: 1.25, minWidth: 0 }}
          >
            {title}
          </Typography>
          <KkStatePill state={state} label={stateLabel} sx={{ ml: 0 }} />
        </Stack>
        <Stack
          direction="row"
          sx={{ alignItems: 'baseline', columnGap: 1, flexWrap: 'wrap', minWidth: 0 }}
        >
          <Box
            component="span"
            sx={{
              ...stepFigures,
              typography: 'caption',
              fontWeight: 700,
              color: 'text.secondary',
              minWidth: 0,
              overflowWrap: 'anywhere',
            }}
          >
            {fact}
          </Box>
          {dueLine}
        </Stack>
      </Stack>
      <KkIcon name="chevron" size="small" sx={{ color: 'text.secondary' }} />
    </ButtonBase>
  );
};
