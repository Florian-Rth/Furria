import { KkButton } from '@furria/ui/KkButton';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { PersonPicker } from '@/features/group-hub/components/PersonPicker';
import { GUEST_SEARCH_DONE } from '../acts-copy';
import type { ActEditor } from '../hooks/use-act-editor';

interface ActGuestPickerProps {
  editor: ActEditor;
}

const keepSearching = (): void => undefined;

export const ActGuestPicker: FC<ActGuestPickerProps> = ({ editor }) => (
  <Stack sx={{ gap: 1, minWidth: 0 }}>
    <PersonPicker selected={null} onSelect={editor.addPerson} onClear={keepSearching} />
    <KkButton size="small" variant="text" onClick={editor.closeAdding}>
      {GUEST_SEARCH_DONE}
    </KkButton>
  </Stack>
);
