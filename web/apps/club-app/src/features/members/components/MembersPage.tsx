import { KkScreen, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { CLUB_ORIGIN, useScreenSearch } from '@/features/session';
import { useMembersQuery } from '../api';
import { toConnectedSentence } from '../members-labels';
import { MembersBody } from './MembersBody';

const MEMBERS_TITLE = 'Mitglieder';

const SEARCH_PLACEHOLDER = 'Name, Gruppe oder Rolle';

export const MembersPage: FC = () => {
  const search = useScreenSearch(SEARCH_PLACEHOLDER);
  const members = useMembersQuery();
  const lead =
    members.data === undefined ? undefined : toConnectedSentence(members.data.members.length);

  return (
    <KkScreen
      kind="list"
      search={search}
      title={MEMBERS_TITLE}
      origin={CLUB_ORIGIN}
      header={<KkTitleHeader title={MEMBERS_TITLE} lead={lead} />}
    >
      <MembersBody />
    </KkScreen>
  );
};
