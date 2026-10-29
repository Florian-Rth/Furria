import { KkButton } from '@furria/ui/KkButton';
import type { KkChoiceChip } from '@furria/ui/KkChoiceChips';
import { KkChoiceChips } from '@furria/ui/KkChoiceChips';
import { KkOutcomeNote } from '@furria/ui/KkOutcomeNote';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toRulePhrase } from '@/features/running-order/running-order-copy';
import { RuleKindSchema, StrengthSchema } from '@/features/running-order/schemas';
import type { DraftLine } from '@/features/running-order/types';
import { useLineWishBuilder } from '../hooks/use-wish-builder';
import { usePlanner } from '../planner-context';
import {
  ADD_WISH_LABEL,
  HOW_LABEL,
  NEW_WISH_TITLE,
  OTHER_LABEL,
  STRENGTH_CHOICES,
  toBuilderStateText,
  toKindChoiceLabel,
  toWishSentence,
  WHAT_LABEL,
} from '../planner-copy';
import { LINE_WISH_KINDS } from '../planner-wishes';

interface PlannerWishFormProps {
  line: DraftLine;
}

const KIND_CHOICES: KkChoiceChip[] = LINE_WISH_KINDS.map((kind) => ({
  id: kind,
  label: toKindChoiceLabel(kind),
}));

export const PlannerWishForm: FC<PlannerWishFormProps> = ({ line }) => {
  const planner = usePlanner();
  const act = line.act;
  const builder = useLineWishBuilder(planner.draft, act.actId, planner.store.apply);

  const others: KkChoiceChip[] = planner.draft.lines.flatMap((candidate) =>
    candidate.key === line.key
      ? []
      : [{ id: String(candidate.act.actId), label: candidate.act.name }],
  );
  const chooseKind = (id: string): void => {
    const parsed = RuleKindSchema.safeParse(id);

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
  const chooseOther = (id: string): void => {
    builder.chooseOther(Number(id));
  };
  const phrase =
    builder.kind === null || (builder.needsOther && builder.otherActId === null)
      ? null
      : toRulePhrase({
          kind: builder.kind,
          otherActName: planner.nameOf(builder.otherActId),
          actKind: null,
        });
  const sentence = toWishSentence(act.name, builder.strength, phrase);
  const stateText = toBuilderStateText(builder.duplicate, builder.outcome, builder.needsOther);
  const otherChoices = builder.needsOther ? (
    <KkChoiceChips
      label={OTHER_LABEL}
      choices={others}
      value={builder.otherActId === null ? null : String(builder.otherActId)}
      onChange={chooseOther}
    />
  ) : null;

  return (
    <Stack sx={{ gap: 1.25, minWidth: 0, pt: 0.5 }}>
      <KkText variant="caption" tone="secondary">
        {NEW_WISH_TITLE}
      </KkText>
      <KkChoiceChips
        label={HOW_LABEL}
        choices={STRENGTH_CHOICES}
        value={builder.strength}
        onChange={chooseStrength}
      />
      <KkChoiceChips
        label={WHAT_LABEL}
        choices={KIND_CHOICES}
        value={builder.kind}
        onChange={chooseKind}
      />
      {otherChoices}
      <KkOutcomeNote sentence={sentence} state={builder.outcome} stateText={stateText} />
      <KkButton size="small" variant="contained" disabled={!builder.canAdd} onClick={builder.add}>
        {ADD_WISH_LABEL}
      </KkButton>
    </Stack>
  );
};
