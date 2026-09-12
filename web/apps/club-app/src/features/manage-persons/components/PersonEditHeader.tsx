import { KkAvatar, KkChip, KkEyebrow, KkPageHeader } from '@furria/ui';
import type { FC } from 'react';
import { PERSON_EYEBROW, toPersonHeadline } from '../manage-persons-labels';
import type { PersonDetails } from '../schemas';

interface PersonEditHeaderProps {
  person: PersonDetails | undefined;
}

export const PersonEditHeader: FC<PersonEditHeaderProps> = ({ person }) => {
  const headline = toPersonHeadline(person);

  const stateChip =
    headline.state === null ? null : (
      <KkChip tone={headline.state.tone} dot={headline.state.dot}>
        {headline.state.label}
      </KkChip>
    );

  return (
    <KkPageHeader
      title={headline.title}
      titleTransform="none"
      eyebrow={
        <KkEyebrow tone="accent" size="small">
          {PERSON_EYEBROW}
        </KkEyebrow>
      }
      avatar={<KkAvatar initials={headline.initials} size="large" />}
      chip={stateChip}
    />
  );
};
