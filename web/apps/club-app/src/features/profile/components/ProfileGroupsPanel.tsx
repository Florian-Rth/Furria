import {
  KkButton,
  KkEmptyState,
  KkErrorState,
  KkPanel,
  KkPanelSection,
  KkSkeletonBlock,
} from '@furria/ui';
import type { FC } from 'react';
import { useMyGroupsQuery } from '@/features/group-hub';
import { PROFILE_SECTION_TITLES } from '../profile-labels';
import { toProfileGroupsErrorMessage } from '../profile-messages';
import { ProfileGroupRow } from './ProfileGroupRow';

const EMPTY_TITLE = 'IN KEINER GRUPPE';
const EMPTY_DESCRIPTION =
  'Du bist in keiner Gruppe. Unter „Gruppen“ siehst du, wer Verstärkung sucht.';
const ERROR_TITLE = 'GRUPPEN NICHT GELADEN';
const RETRY_LABEL = 'Erneut laden';
const SKELETON_LINES = 3;

export const ProfileGroupsPanel: FC = () => {
  const myGroups = useMyGroupsQuery();
  const groups = myGroups.data?.groups;
  const errorMessage = toProfileGroupsErrorMessage(myGroups.error);

  const reload = (): void => {
    void myGroups.refetch();
  };

  if (groups === undefined) {
    const retry = (
      <KkButton size="small" variant="outlined" onClick={reload}>
        {RETRY_LABEL}
      </KkButton>
    );

    const placeholder =
      errorMessage === null ? (
        <KkSkeletonBlock lines={SKELETON_LINES} />
      ) : (
        <KkErrorState title={ERROR_TITLE} description={errorMessage} action={retry} />
      );

    return (
      <KkPanelSection title={PROFILE_SECTION_TITLES.groups}>
        <KkPanel variant="block">{placeholder}</KkPanel>
      </KkPanelSection>
    );
  }

  const body =
    groups.length === 0 ? (
      <KkEmptyState size="panel" title={EMPTY_TITLE} description={EMPTY_DESCRIPTION} />
    ) : (
      groups.map((group) => <ProfileGroupRow key={group.groupId} group={group} />)
    );

  return (
    <KkPanelSection title={PROFILE_SECTION_TITLES.groups}>
      <KkPanel>{body}</KkPanel>
    </KkPanelSection>
  );
};
