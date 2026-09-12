import type { FC } from 'react';
import { AppListAsideSkeleton, AppListSkeleton } from '@/features/session';
import { useMembersQuery } from '../api';
import { useMemberSearch } from '../hooks/use-member-search';
import { MEMBERS_SECTION_TITLE } from '../members-labels';
import { toMembersErrorMessage } from '../members-messages';
import type { MemberSummary } from '../schemas';
import { MembersError } from './MembersError';
import { MembersView } from './MembersView';

const NO_MEMBERS: readonly MemberSummary[] = [];
const LOADING_LABEL = 'Mitgliederliste wird geladen';
const TOOLBAR_CHIPS = 5;
const ASIDE_SIZE = 4;

export const MembersBody: FC = () => {
  const members = useMembersQuery();
  const search = useMemberSearch(members.data?.members ?? NO_MEMBERS);
  const errorMessage = toMembersErrorMessage(members.error);

  const reload = (): void => {
    void members.refetch();
  };

  if (members.data !== undefined) {
    return <MembersView search={search} />;
  }
  if (errorMessage !== null) {
    return <MembersError message={errorMessage} onRetry={reload} />;
  }

  return (
    <AppListSkeleton
      label={LOADING_LABEL}
      sectionTitle={MEMBERS_SECTION_TITLE}
      toolbarChips={TOOLBAR_CHIPS}
      listShape="rows"
      aside={<AppListAsideSkeleton />}
      asideSize={ASIDE_SIZE}
      asideDesktopOnly
      stickyAside
      asideLeadsFocus
    />
  );
};
