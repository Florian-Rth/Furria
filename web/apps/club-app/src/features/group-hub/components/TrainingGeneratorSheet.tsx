import { KkAlert, KkDateField, KkSheet, KkTextField } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { ChangeEvent, FC } from 'react';
import type { TrainingGeneratorControl } from '../hooks/use-training-generator';
import {
  GENERATOR_CANCEL_LABEL,
  GENERATOR_CLOSE_LABEL,
  GENERATOR_CONFIRM_LABEL,
  GENERATOR_END_HINT,
  GENERATOR_END_LABEL,
  GENERATOR_SHEET_TITLE,
  GENERATOR_TITLE_HINT,
  GENERATOR_TITLE_LABEL,
} from '../rhythm-labels';
import { TrainingGeneratorBody } from './TrainingGeneratorBody';

interface TrainingGeneratorSheetProps {
  control: TrainingGeneratorControl;
  hasRhythm: boolean;
}

export const TrainingGeneratorSheet: FC<TrainingGeneratorSheetProps> = ({ control, hasRhythm }) => {
  const changeTitle = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    control.setTitle(event.target.value);
  };

  const rejection =
    control.rejection === null ? null : <KkAlert severity="error">{control.rejection}</KkAlert>;
  const titleError = control.title.trim() === '';
  const canSubmit = hasRhythm && control.tickedCount > 0 && !titleError;

  return (
    <KkSheet id={control.sheetId} title={GENERATOR_SHEET_TITLE} closeLabel={GENERATOR_CLOSE_LABEL}>
      <KkSheet.Body>
        <Stack sx={{ gap: 2, minWidth: 0 }}>
          <KkTextField
            name="trainingTitle"
            label={GENERATOR_TITLE_LABEL}
            value={control.title}
            onChange={changeTitle}
            error={titleError}
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
      </KkSheet.Body>
      <KkSheet.Actions
        primary={{
          label: GENERATOR_CONFIRM_LABEL,
          onClick: control.submit,
          loading: control.isSaving,
          disabled: !canSubmit,
        }}
        secondary={{
          label: GENERATOR_CANCEL_LABEL,
          onClick: control.close,
          disabled: control.isSaving,
        }}
      />
    </KkSheet>
  );
};
