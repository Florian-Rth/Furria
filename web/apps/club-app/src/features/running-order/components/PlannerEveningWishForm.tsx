import { KkButton } from '@furria/ui/KkButton';
import type { KkChoiceChip } from '@furria/ui/KkChoiceChips';
import { KkChoiceChips } from '@furria/ui/KkChoiceChips';
import { KkOutcomeNote } from '@furria/ui/KkOutcomeNote';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toActKindPlural } from '@/features/running-order/running-order-copy';
import { ACT_KINDS, ActKindSchema, StrengthSchema } from '@/features/running-order/schemas';
import { useEveningWishBuilder } from '../hooks/use-wish-builder';
import { usePlanner } from '../planner-context';
import {
  ADD_WISH_LABEL,
  HOW_LABEL,
  KIND_LABEL,
  STRENGTH_CHOICES,
  toBuilderStateText,
  toEveningWishLabel,
} from '../planner-copy';

const KIND_CHOICES: KkChoiceChip[] = ACT_KINDS.filter((kind) => kind !== 'point').map((kind) => ({
  id: kind,
  label: toActKindPlural(kind),
}));

interface PlannerEveningWishFormProps {
  onAdded?: () => void;
}

export const PlannerEveningWishForm: FC<PlannerEveningWishFormProps> = ({ onAdded }) => {
  const planner = usePlanner();
  const builder = useEveningWishBuilder(planner.draft, planner.store.apply);
  const chooseKind = (id: string): void => {
    const parsed = ActKindSchema.safeParse(id);

    if (parsed.success) {
      builder.chooseKind(parsed.data);
    }
  };
  const chooseStrength = (id: string): void => {
    const parsed = StrengthSchema.safeParse(id);

    if (parsed.success) {
      builder.chooseStrength(parsed.data);
    }
  };
  const add = (): void => {
    builder.add();
    onAdded?.();
  };

  return (
    <Stack sx={{ gap: 1.25, minWidth: 0 }}>
      <KkChoiceChips
        label={HOW_LABEL}
        choices={STRENGTH_CHOICES}
        value={builder.strength}
        onChange={chooseStrength}
      />
      <KkChoiceChips
        label={KIND_LABEL}
        choices={KIND_CHOICES}
        value={builder.actKind}
        onChange={chooseKind}
      />
      <KkOutcomeNote
        sentence={toEveningWishLabel(builder.actKind, builder.strength)}
        state={builder.outcome}
        stateText={toBuilderStateText(builder.duplicate, builder.outcome, false)}
      />
      <KkButton size="small" variant="contained" disabled={!builder.canAdd} onClick={add}>
        {ADD_WISH_LABEL}
      </KkButton>
    </Stack>
  );
};
