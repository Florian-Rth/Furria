import { KkHall } from '@furria/ui/KkHall';
import { KkHeading } from '@furria/ui/KkHeading';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { CLOSE_LABEL, EVENING_ELAPSED_LABEL } from '../heute-b-copy';
import { HeuteElapsed } from './HeuteElapsed';

interface HeuteHeadProps {
  title: string;
  eveningSince: string | null;
  onClose: () => void;
}

export const HeuteHead: FC<HeuteHeadProps> = ({ title, eveningSince, onClose }) => (
  <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
    <KkHall.Close label={CLOSE_LABEL} onPress={onClose} />
    <Stack sx={{ flex: 1, minWidth: 0 }}>
      <KkHeading level={4} component="h1">
        {title}
      </KkHeading>
      <HeuteElapsed label={EVENING_ELAPSED_LABEL} since={eveningSince} />
    </Stack>
  </Stack>
);
