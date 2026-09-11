import { KkMeta, KkPanelHeader } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { MemberContactPanel } from '@/features/members';
import type { MePerson } from '@/lib/api/schemas';
import { PROFILE_SECTION_TITLES, toPreviewContact } from '../profile-labels';

const PREVIEW_CAPTION =
  'So steht dein Kontakt im Verzeichnis, wenn ein anderes Mitglied ihn aufruft.';

interface ProfileVisibilityPreviewProps {
  person: MePerson;
}

export const ProfileVisibilityPreview: FC<ProfileVisibilityPreviewProps> = ({ person }) => {
  const contact = toPreviewContact(person, person.contactVisibleToMembers);

  return (
    <Stack sx={{ gap: 2, minWidth: 0 }}>
      <Stack sx={{ gap: 1.25, minWidth: 0 }}>
        <KkPanelHeader title={PROFILE_SECTION_TITLES.preview} />
        <KkMeta>{PREVIEW_CAPTION}</KkMeta>
      </Stack>
      <MemberContactPanel contact={contact} firstName={person.firstName} />
    </Stack>
  );
};
