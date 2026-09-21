import { KkButton, KkEmptyState, KkErrorState, KkLead, KkPanel, KkSkeletonRow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { TrainingGeneratorControl } from '../hooks/use-training-generator';
import { GENERATOR_NO_RHYTHM_LINE, GENERATOR_NO_RHYTHM_TITLE } from '../rhythm-labels';
import { TrainingPreviewList } from './TrainingPreviewList';

const SKELETON_ROWS = 5;
const RETRY_LABEL = 'Noch einmal';
const ERROR_TITLE = 'VORSCHAU NICHT GELADEN';

interface TrainingGeneratorBodyProps {
  control: TrainingGeneratorControl;
  hasRhythm: boolean;
}

export const TrainingGeneratorBody: FC<TrainingGeneratorBodyProps> = ({ control, hasRhythm }) => {
  if (!hasRhythm) {
    return (
      <KkPanel variant="block">
        <KkEmptyState
          size="panel"
          title={GENERATOR_NO_RHYTHM_TITLE}
          description={GENERATOR_NO_RHYTHM_LINE}
        />
      </KkPanel>
    );
  }

  if (control.errorMessage !== null) {
    const retry = (
      <KkButton size="small" variant="outlined" onClick={control.retry}>
        {RETRY_LABEL}
      </KkButton>
    );

    return (
      <KkPanel variant="block">
        <KkErrorState title={ERROR_TITLE} description={control.errorMessage} action={retry} />
      </KkPanel>
    );
  }

  if (control.isLoading) {
    return (
      <KkPanel variant="block">
        <KkSkeletonRow count={SKELETON_ROWS} shape="select" />
      </KkPanel>
    );
  }

  return (
    <Stack sx={{ gap: 1.25, minWidth: 0 }}>
      <TrainingPreviewList
        entries={control.entries}
        onToggle={control.toggle}
        onTickAll={control.tickAll}
        onTickNone={control.tickNone}
      />
      <KkLead>{control.summary}</KkLead>
    </Stack>
  );
};
