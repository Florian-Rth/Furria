import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkHeading } from '@furria/ui/KkHeading';
import { KkMeta } from '@furria/ui/KkMeta';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useElapsedText } from '../hooks/use-elapsed-text';

interface HeuteElapsedProps {
  label: string;
  since: string | null;
  large?: boolean;
}

export const HeuteElapsed: FC<HeuteElapsedProps> = ({ label, since, large = false }) => {
  const text = useElapsedText(since);

  if (text === null) {
    return null;
  }

  if (!large) {
    return (
      <KkMeta>
        {label} {text}
      </KkMeta>
    );
  }

  return (
    <Stack sx={{ minWidth: 0 }}>
      <KkEyebrow tone="muted">{label}</KkEyebrow>
      <KkHeading level={2} component="p">
        {text}
      </KkHeading>
    </Stack>
  );
};
