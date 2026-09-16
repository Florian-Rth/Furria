import { KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import { MemberContactPanel } from '@/features/members';
import type { MePerson } from '@/lib/api/schemas';
import {
  PROFILE_SECTION_TITLES,
  toPreviewContact,
  VISIBILITY_PREVIEW_CAPTION,
} from '../profile-labels';

interface ProfileVisibilityPreviewProps {
  person: MePerson;
}

export const ProfileVisibilityPreview: FC<ProfileVisibilityPreviewProps> = ({ person }) => {
  const contact = toPreviewContact(person, person.contactVisibleToMembers);

  return (
    <KkPanelSection title={PROFILE_SECTION_TITLES.preview} description={VISIBILITY_PREVIEW_CAPTION}>
      <MemberContactPanel contact={contact} firstName={person.firstName} nested />
    </KkPanelSection>
  );
};
