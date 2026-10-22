import { KkMasterDetail } from '@furria/ui/KkMasterDetail';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkRetryAlert } from '@furria/ui/KkRetryAlert';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { AppListSkeleton } from '@/features/session/components/AppListSkeleton';
import { useRolesHub } from '../hooks/use-roles-hub';
import { toRolesErrorMessage } from '../manage-roles-messages';
import { LOADING_LABEL, NO_ROLES_NOTE, RETRY_LABEL } from '../roles-hub-copy';
import { RolesArchived } from './RolesArchived';
import { RolesList } from './RolesList';
import { RolesRights } from './RolesRights';
import { RolesSide } from './RolesSide';
import { RolesViewSwitch } from './RolesViewSwitch';

export const RolesBody: FC = () => {
  const hub = useRolesHub();

  if (hub.query.data === undefined) {
    const message = toRolesErrorMessage(hub.query.error);

    return message === null ? (
      <AppListSkeleton label={LOADING_LABEL} listShape="rows" />
    ) : (
      <KkRetryAlert
        message={message}
        retrying={hub.query.isFetching}
        onRetry={hub.reload}
        retryLabel={RETRY_LABEL}
      />
    );
  }

  if (hub.roles.length === 0) {
    return <KkMeta>{NO_ROLES_NOTE}</KkMeta>;
  }

  const isSideOpen = hub.isWide && (hub.selected !== null || hub.form.target !== null);
  const masterSpan = isSideOpen ? 7 : 12;
  const selectedId = hub.form.target?.roleId ?? hub.selected?.roleId ?? null;
  const lens =
    hub.view === 'roles' ? (
      <>
        <RolesList
          roles={hub.list}
          totalKeys={hub.catalogue.length}
          compact={isSideOpen}
          selectedId={selectedId}
          highlightedKey={hub.highlightedKey}
          onOpen={hub.open}
        />
        <RolesArchived
          roles={hub.archived}
          compact={isSideOpen}
          selectedId={selectedId}
          highlightedKey={hub.highlightedKey}
          onOpen={hub.open}
        />
      </>
    ) : (
      <RolesRights groups={hub.rightGroups} selectedId={selectedId} onOpen={hub.open} />
    );

  return (
    <Stack sx={{ gap: 2, minWidth: 0 }}>
      <RolesViewSwitch view={hub.view} onChoose={hub.chooseView} />
      <KkMasterDetail>
        <KkMasterDetail.Master span={masterSpan}>
          <Stack sx={{ gap: 2.5, minWidth: 0 }}>{lens}</Stack>
        </KkMasterDetail.Master>
        <RolesSide
          roles={hub.roles}
          catalogue={hub.catalogue}
          selected={hub.selected}
          request={hub.request}
          form={hub.form}
          isWide={hub.isWide}
          today={hub.today}
          onClose={hub.closePane}
        />
      </KkMasterDetail>
    </Stack>
  );
};
