import { KkButton, KkEmptyState, KkMeta, KkPanel } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  GENERATOR_ALL_LABEL,
  GENERATOR_EMPTY_LINE,
  GENERATOR_EMPTY_TITLE,
  GENERATOR_LEGEND,
  GENERATOR_NONE_LABEL,
} from '../rhythm-labels';
import type { TrainingPreviewEntry } from '../training-preview';
import { TrainingPreviewRow } from './TrainingPreviewRow';

interface TrainingPreviewListProps {
  entries: readonly TrainingPreviewEntry[];
  onToggle: (key: string) => void;
  onTickAll: () => void;
  onTickNone: () => void;
}

export const TrainingPreviewList: FC<TrainingPreviewListProps> = ({
  entries,
  onToggle,
  onTickAll,
  onTickNone,
}) => {
  if (entries.length === 0) {
    return (
      <KkPanel variant="block">
        <KkEmptyState
          size="panel"
          title={GENERATOR_EMPTY_TITLE}
          description={GENERATOR_EMPTY_LINE}
        />
      </KkPanel>
    );
  }

  const rows = entries.map((entry) => (
    <TrainingPreviewRow key={entry.key} entry={entry} onToggle={onToggle} />
  ));

  return (
    <Stack sx={{ gap: 1, minWidth: 0 }}>
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, minWidth: 0 }}
      >
        <KkMeta>{GENERATOR_LEGEND}</KkMeta>
        <Stack direction="row" sx={{ gap: 0.75, flexShrink: 0 }}>
          <KkButton size="small" variant="outlined" onClick={onTickAll}>
            {GENERATOR_ALL_LABEL}
          </KkButton>
          <KkButton size="small" variant="outlined" onClick={onTickNone}>
            {GENERATOR_NONE_LABEL}
          </KkButton>
        </Stack>
      </Stack>
      <KkPanel variant="list">{rows}</KkPanel>
    </Stack>
  );
};
