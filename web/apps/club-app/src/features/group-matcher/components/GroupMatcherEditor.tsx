import { KkPanelStack } from '@furria/ui/KkPanelStack';
import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { GroupEditorError } from '@/features/group-hub/components/GroupEditorError';
import { GroupEditorSkeleton } from '@/features/group-hub/components/GroupEditorSkeleton';
import { toHubEditorOrigin } from '@/features/group-hub/group-hub-labels';
import type { GroupHub } from '@/features/group-hub/schemas';
import { useGroupMatcherPageQuery } from '../api';
import { GROUP_MATCHER_TITLE, toGroupMatcherErrorMessage } from '../group-matcher-labels';
import { AdmissionAgesSection } from './AdmissionAgesSection';
import { StatementsSection } from './StatementsSection';

interface GroupMatcherEditorProps {
  hub: GroupHub;
}

export const GroupMatcherEditor: FC<GroupMatcherEditorProps> = ({ hub }) => {
  const page = useGroupMatcherPageQuery(hub.groupId);
  const origin = toHubEditorOrigin(hub);

  const reload = (): void => {
    void page.refetch();
  };

  if (page.data === undefined) {
    if (page.error === null) {
      return <GroupEditorSkeleton />;
    }

    const errorMessage = toGroupMatcherErrorMessage(page.error);

    return (
      <GroupEditorError
        title={GROUP_MATCHER_TITLE}
        origin={origin}
        message={errorMessage}
        onRetry={reload}
        isRetrying={page.isFetching}
      />
    );
  }

  return (
    <KkScreen kind="fullscreen" title={GROUP_MATCHER_TITLE} origin={origin}>
      <KkPanelStack>
        <StatementsSection groupId={hub.groupId} page={page.data} />
        <AdmissionAgesSection groupId={hub.groupId} admissionAges={page.data.admissionAges} />
      </KkPanelStack>
    </KkScreen>
  );
};
