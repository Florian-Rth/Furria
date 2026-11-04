import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useHallBuilderContext } from '../hall-builder-context';
import { HallElementSection } from './HallElementSection';
import { HallHelpSection } from './HallHelpSection';
import { HallManySection } from './HallManySection';
import { HallSelectionActions } from './HallSelectionActions';
import { HallSettingsSection } from './HallSettingsSection';

export const HallInspectorBody: FC = () => {
  const { selected } = useHallBuilderContext();
  const [only] = selected;

  if (only === undefined) {
    return (
      <Stack sx={{ gap: 2 }}>
        <HallSettingsSection />
        <HallHelpSection />
      </Stack>
    );
  }

  const section =
    selected.length === 1 ? (
      <HallElementSection key={only.id} element={only} />
    ) : (
      <HallManySection count={selected.length} />
    );

  return (
    <Stack sx={{ gap: 2 }}>
      {section}
      <HallSelectionActions />
      <HallHelpSection />
    </Stack>
  );
};
