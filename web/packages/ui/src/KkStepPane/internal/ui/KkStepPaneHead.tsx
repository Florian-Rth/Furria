import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import type { KkIconName } from '../../../KkIcon';
import { KkStateBadge } from '../../../KkStateBadge/KkStateBadge';
import { KkStatePill } from '../../../KkStatePill/KkStatePill';
import { stepFigures, stepLabel } from '../../../KkStatePill/state-paint';
import type { KkStepState } from '../../../KkStatePill/step-state';

interface KkStepPaneHeadProps {
  icon: KkIconName;
  title: string;
  context: string;
  state: KkStepState;
  stateLabel: string;
  due?: string;
  media?: ReactNode;
  actions?: ReactNode;
}

export const KkStepPaneHead: FC<KkStepPaneHeadProps> = ({
  icon,
  title,
  context,
  state,
  stateLabel,
  due,
  media,
  actions,
}) => {
  const dueLine =
    due === undefined ? null : (
      <Box
        component="span"
        sx={{
          ...stepFigures,
          typography: 'caption',
          fontWeight: 700,
          color: 'text.secondary',
          minWidth: 0,
        }}
      >
        {due}
      </Box>
    );
  const actionSlot =
    actions === undefined ? null : (
      <Stack direction="row" sx={{ flexShrink: 0, alignItems: 'center', gap: 0.25 }}>
        {actions}
      </Stack>
    );
  const pill =
    stateLabel === '' ? null : <KkStatePill state={state} label={stateLabel} sx={{ ml: 0 }} />;

  return (
    <Stack data-kk-step-pane-head sx={{ gap: 1.25, minWidth: 0 }}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
        {media}
        <Box component="span" sx={{ ...stepLabel, ...stepFigures, flex: 1 }}>
          {context}
        </Box>
        {actionSlot}
      </Stack>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, minWidth: 0 }}>
        <KkStateBadge icon={icon} state={state} size="large" />
        <Stack sx={{ minWidth: 0, gap: 0.5 }}>
          <Typography component="h2" variant="h3" sx={{ lineHeight: 1.05, minWidth: 0 }}>
            {title}
          </Typography>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', columnGap: 1.25, rowGap: 0.25, flexWrap: 'wrap' }}
          >
            {pill}
            {dueLine}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
