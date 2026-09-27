import { KkButton, KkNote } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toAdoptionLine } from '../adoption-suggestion';
import type { AdoptionCandidate } from '../schemas';

const ADOPT_LABEL = 'Diese Person übernehmen';

interface PersonAdoptionSuggestionProps {
  candidate: AdoptionCandidate;
  onAdopt: () => void;
}

export const PersonAdoptionSuggestion: FC<PersonAdoptionSuggestionProps> = ({
  candidate,
  onAdopt,
}) => {
  const line = toAdoptionLine(candidate);

  return (
    <Stack role="status" sx={{ gap: 0.5, alignItems: 'flex-start', minWidth: 0 }}>
      <KkNote tone="hint" icon="info">
        {line}
      </KkNote>
      <KkButton variant="text" onClick={onAdopt}>
        {ADOPT_LABEL}
      </KkButton>
    </Stack>
  );
};
