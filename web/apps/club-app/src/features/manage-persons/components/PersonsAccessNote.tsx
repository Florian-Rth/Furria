import { KkButton, KkNote } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { PersonAccessFilter } from '../person-access-filter';
import { ACCESS_FILTER_CLEAR_LABEL, toAccessFilterNote } from '../person-access-filter';

interface PersonsAccessNoteProps {
  filter: PersonAccessFilter;
  onClear: () => void;
}

export const PersonsAccessNote: FC<PersonsAccessNoteProps> = ({ filter, onClear }) => (
  <Stack
    direction="row"
    sx={{ minWidth: 0, gap: 1, alignItems: 'center', justifyContent: 'space-between' }}
  >
    <KkNote tone="info" icon="info">
      {toAccessFilterNote(filter)}
    </KkNote>
    <KkButton variant="text" size="small" onClick={onClear} sx={{ flexShrink: 0 }}>
      {ACCESS_FILTER_CLEAR_LABEL}
    </KkButton>
  </Stack>
);
