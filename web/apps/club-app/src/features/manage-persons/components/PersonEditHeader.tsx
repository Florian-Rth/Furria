import { KkAvatar, KkChip, KkEyebrow, KkMeta, KkScreenHeader } from '@furria/ui';
import type { FC } from 'react';
import { useMeQuery } from '@/features/session';
import { PERSON_EYEBROW, toPersonHeadline } from '../manage-persons-labels';
import { toArchiveNote } from '../person-archive';
import type { PersonDetails } from '../schemas';

interface PersonEditHeaderProps {
  person: PersonDetails | undefined;
}

export const PersonEditHeader: FC<PersonEditHeaderProps> = ({ person }) => {
  const headline = toPersonHeadline(person);
  const me = useMeQuery();
  const portrait = person?.portrait?.picture?.smallUrl;
  const archiveNote = toArchiveNote(
    person?.archive ?? null,
    me.data?.person?.id ?? null,
    new Date(),
  );

  const archiveMeta = archiveNote === null ? null : <KkMeta>{archiveNote}</KkMeta>;

  const stateRow =
    headline.state === null ? null : (
      <KkScreenHeader.Meta>
        <KkChip tone={headline.state.tone} dot={headline.state.dot}>
          {headline.state.label}
        </KkChip>
        {archiveMeta}
      </KkScreenHeader.Meta>
    );

  return (
    <KkScreenHeader>
      <KkScreenHeader.Visual>
        <KkAvatar initials={headline.initials} source={portrait} size="large" />
      </KkScreenHeader.Visual>
      <KkScreenHeader.Text>
        <KkEyebrow tone="accent">{PERSON_EYEBROW}</KkEyebrow>
        <KkScreenHeader.Title transform="none">{headline.title}</KkScreenHeader.Title>
        {stateRow}
      </KkScreenHeader.Text>
    </KkScreenHeader>
  );
};
