import { KkAvatar, KkChip, KkEyebrow, KkScreenHeader } from '@furria/ui';
import type { FC } from 'react';
import { PERSON_EYEBROW, toPersonHeadline } from '../manage-persons-labels';
import type { PersonDetails } from '../schemas';

interface PersonEditHeaderProps {
  person: PersonDetails | undefined;
}

export const PersonEditHeader: FC<PersonEditHeaderProps> = ({ person }) => {
  const headline = toPersonHeadline(person);

  const stateRow =
    headline.state === null ? null : (
      <KkScreenHeader.Meta>
        <KkChip tone={headline.state.tone} dot={headline.state.dot}>
          {headline.state.label}
        </KkChip>
      </KkScreenHeader.Meta>
    );

  return (
    <KkScreenHeader>
      <KkScreenHeader.Visual>
        <KkAvatar initials={headline.initials} size="large" />
      </KkScreenHeader.Visual>
      <KkScreenHeader.Text>
        <KkEyebrow tone="accent">{PERSON_EYEBROW}</KkEyebrow>
        <KkScreenHeader.Title transform="none">{headline.title}</KkScreenHeader.Title>
        {stateRow}
      </KkScreenHeader.Text>
    </KkScreenHeader>
  );
};
