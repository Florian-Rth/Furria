import { KkButton } from '@furria/ui/KkButton';
import { KkConfirmDialog } from '@furria/ui/KkConfirmDialog';
import { KkFieldRow } from '@furria/ui/KkFieldRow';
import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkTextField } from '@furria/ui/KkTextField';
import type { ChangeEvent, FC } from 'react';
import { LABEL_MAX_LENGTH } from '@/features/hall-plan/schemas';
import { useHallBuilderContext } from '../hall-builder-context';
import {
  CANCEL_LABEL,
  HALL_DELETE_EXPLANATION,
  HALL_DELETE_EYEBROW,
  HALL_DELETE_LABEL,
  HALL_DELETE_QUESTION,
  HALL_NAME_LABEL,
  HALL_SECTION_TITLE,
  HALL_VENUE_LABEL,
  INSPECTOR_CLOSE_LABEL,
  SIZE_COUNT_LABEL,
} from '../hall-builder-copy';
import { hallSizeLabel } from '../hall-builder-view';
import { useHallDeletion } from '../hooks/use-hall-deletion';

export const HallSettingsSection: FC = () => {
  const builder = useHallBuilderContext();
  const deletion = useHallDeletion(builder.hall.hallId, builder.origin);
  const size = hallSizeLabel(builder.document);
  const facts = [
    { label: HALL_VENUE_LABEL, value: builder.hall.venueName },
    { label: SIZE_COUNT_LABEL, value: size },
  ];
  const deletionError = deletion.rejection ?? undefined;
  const isNameMissing = builder.name.trim() === '';

  const rename = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    builder.rename(event.target.value);
  };

  return (
    <KkFormSection title={HALL_SECTION_TITLE}>
      <KkTextField
        name="hallName"
        label={HALL_NAME_LABEL}
        value={builder.name}
        onChange={rename}
        maxLength={LABEL_MAX_LENGTH}
        error={isNameMissing}
        required
      />
      <KkFieldRow label={HALL_VENUE_LABEL} value={builder.hall.venueName} />
      <KkFieldRow label={SIZE_COUNT_LABEL} value={size} />
      <KkButton variant="outlined" tone="danger" onClick={deletion.open}>
        {HALL_DELETE_LABEL}
      </KkButton>
      <KkConfirmDialog
        open={deletion.isOpen}
        onClose={deletion.close}
        onConfirm={deletion.confirm}
        tone="danger"
        eyebrow={HALL_DELETE_EYEBROW}
        question={HALL_DELETE_QUESTION}
        explanation={HALL_DELETE_EXPLANATION}
        facts={facts}
        error={deletionError}
        confirmLabel={HALL_DELETE_LABEL}
        cancelLabel={CANCEL_LABEL}
        closeLabel={INSPECTOR_CLOSE_LABEL}
        busy={deletion.isDeleting}
      />
    </KkFormSection>
  );
};
