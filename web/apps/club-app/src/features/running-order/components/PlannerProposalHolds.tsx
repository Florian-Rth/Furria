import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { usePlanner } from '../planner-context';
import { HOLDS_HIDE_LABEL, HOLDS_TITLE, HOLDS_UNAVOIDABLE } from '../planner-copy';
import { PlannerHoldItem } from './PlannerHoldItem';

export const PlannerProposalHolds: FC = () => {
  const { suggestion } = usePlanner();

  if (!suggestion.explains) {
    return null;
  }

  const items = suggestion.holds.map((hold) => <PlannerHoldItem key={hold.id} hold={hold} />);
  const unavoidable = suggestion.unavoidable ? (
    <KkText variant="caption" tone="secondary">
      {HOLDS_UNAVOIDABLE}
    </KkText>
  ) : null;
  const hide = suggestion.isActive ? null : (
    <KkIconButton label={HOLDS_HIDE_LABEL} icon="close" size="small" onClick={suggestion.discard} />
  );

  return (
    <Stack component="section" aria-label={HOLDS_TITLE} sx={{ minWidth: 0 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <KkEyebrow tone="muted">{HOLDS_TITLE}</KkEyebrow>
        {hide}
      </Stack>
      {items}
      {unavoidable}
    </Stack>
  );
};
