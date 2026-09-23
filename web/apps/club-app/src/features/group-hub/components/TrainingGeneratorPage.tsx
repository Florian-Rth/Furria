import { KkAlert, KkDateField, KkScreen, KkTextField } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { useNavigate } from '@tanstack/react-router';
import type { ChangeEvent, FC } from 'react';
import { toHubEditorOrigin } from '../group-hub-labels';
import { useTrainingGenerator } from '../hooks/use-training-generator';
import {
  GENERATOR_CANCEL_LABEL,
  GENERATOR_CONFIRM_LABEL,
  GENERATOR_END_HINT,
  GENERATOR_END_LABEL,
  GENERATOR_SHEET_TITLE,
  GENERATOR_TITLE_HINT,
  GENERATOR_TITLE_LABEL,
} from '../rhythm-labels';
import type { GroupHub } from '../schemas';
import { TrainingGeneratorBody } from './TrainingGeneratorBody';
import { TrainingGeneratorSkeleton } from './TrainingGeneratorSkeleton';

interface TrainingGeneratorPageProps {
  hub: GroupHub;
}

export const TrainingGeneratorPage: FC<TrainingGeneratorPageProps> = ({ hub }) => {
  const control = useTrainingGenerator(hub.groupId);
  const navigate = useNavigate();
  const hasRhythm = hub.trainingSlots.length > 0;

  const changeTitle = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    control.setTitle(event.target.value);
  };

  const cancel = (): void => {
    void navigate({
      to: '/groups/$groupId',
      params: { groupId: String(hub.groupId) },
      replace: true,
    });
  };

  const rejection =
    control.rejection === null ? null : <KkAlert severity="error">{control.rejection}</KkAlert>;

  const form = control.isLoading ? (
    <TrainingGeneratorSkeleton />
  ) : (
    <Stack sx={{ gap: 2, minWidth: 0 }}>
      <KkTextField
        name="trainingTitle"
        label={GENERATOR_TITLE_LABEL}
        value={control.title}
        onChange={changeTitle}
        error={control.title.trim() === ''}
        helperText={GENERATOR_TITLE_HINT}
      />
      <KkDateField
        name="endsOn"
        label={GENERATOR_END_LABEL}
        value={control.endsOn}
        onChange={control.setEndsOn}
        quickChoices={control.quickChoices}
        hint={GENERATOR_END_HINT}
      />
      <TrainingGeneratorBody control={control} hasRhythm={hasRhythm} />
      {rejection}
    </Stack>
  );

  return (
    <KkScreen
      kind="working"
      title={GENERATOR_SHEET_TITLE}
      origin={toHubEditorOrigin(hub)}
      action={{
        primary: {
          label: GENERATOR_CONFIRM_LABEL,
          onSelect: control.submit,
          loading: control.isSaving,
          disabled: control.isLoading,
        },
        secondary: { label: GENERATOR_CANCEL_LABEL, onSelect: cancel },
      }}
    >
      {form}
    </KkScreen>
  );
};
