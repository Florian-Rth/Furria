import type { KkChoiceChip } from '@furria/ui/KkChoiceChips';
import { KkChoiceChips } from '@furria/ui/KkChoiceChips';
import { KkMeta } from '@furria/ui/KkMeta';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { PlannerDetailSection } from '@/features/running-order/components/PlannerDetailSection';
import { STRENGTH_CHOICES } from '@/features/running-order/planner-copy';
import {
  ACT_WISH_KINDS,
  ActWishKindSchema,
  StrengthSchema,
} from '@/features/running-order/schemas';
import {
  NEW_WISH_LABEL,
  NONE,
  toWishKindLabel,
  WISH_KIND_LABEL,
  WISH_STRENGTH_LABEL,
  WISHES_TITLE,
} from '../acts-copy';
import type { ActEditor } from '../hooks/use-act-editor';
import { ActWishLine } from './ActWishLine';

const KIND_CHOICES: KkChoiceChip[] = ACT_WISH_KINDS.map((kind) => ({
  id: kind,
  label: toWishKindLabel(kind),
}));

const STRENGTHS: KkChoiceChip[] = STRENGTH_CHOICES.map(({ id, label }) => ({ id, label }));

interface ActWishesSectionProps {
  editor: ActEditor;
}

export const ActWishesSection: FC<ActWishesSectionProps> = ({ editor }) => {
  if (!editor.setsWishes) {
    return null;
  }

  const lines = editor.draft.wishes.map((wish) => (
    <ActWishLine key={wish.kind} wish={wish} onRemove={editor.removeWish} />
  ));
  const meta = lines.length === 0 ? NONE : String(lines.length);
  const chooseStrength = (id: string): void => {
    const parsed = StrengthSchema.safeParse(id);

    if (parsed.success) {
      editor.chooseWishStrength(parsed.data);
    }
  };
  const addWish = (id: string): void => {
    const parsed = ActWishKindSchema.safeParse(id);

    if (parsed.success) {
      editor.addWish(parsed.data);
    }
  };
  const list = lines.length === 0 ? null : <Stack sx={{ gap: 0.5, minWidth: 0 }}>{lines}</Stack>;

  const metaLine = <KkMeta>{meta}</KkMeta>;
  const newWish = (
    <Stack sx={{ gap: 1, minWidth: 0 }} aria-label={NEW_WISH_LABEL}>
      <KkChoiceChips
        label={WISH_STRENGTH_LABEL}
        choices={STRENGTHS}
        value={editor.wishStrength}
        onChange={chooseStrength}
      />
      <KkChoiceChips
        label={WISH_KIND_LABEL}
        choices={KIND_CHOICES}
        value={null}
        onChange={addWish}
      />
    </Stack>
  );

  return (
    <PlannerDetailSection title={WISHES_TITLE} action={metaLine}>
      {list}
      {newWish}
    </PlannerDetailSection>
  );
};
