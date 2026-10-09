import { KkHubRow, KkPanel, KkPanelSection } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toPortraitStatusLine } from '@/features/pictures';
import type { MePerson } from '@/lib/api/schemas';
import { PORTRAIT_PATH, PORTRAIT_TITLE, PROFILE_SECTION_TITLES } from '../profile-labels';

interface ProfilePortraitPanelProps {
  person: MePerson;
}

export const ProfilePortraitPanel: FC<ProfilePortraitPanelProps> = ({ person }) => {
  const statusLine = toPortraitStatusLine(person.portrait);

  return (
    <KkPanelSection title={PROFILE_SECTION_TITLES.portrait}>
      <KkPanel>
        <KkHubRow
          label={PORTRAIT_TITLE}
          icon="person"
          meta={statusLine}
          component={Link}
          to={PORTRAIT_PATH}
        />
      </KkPanel>
    </KkPanelSection>
  );
};
