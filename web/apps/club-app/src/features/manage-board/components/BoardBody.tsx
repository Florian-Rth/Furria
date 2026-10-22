import { KkMasterDetail } from '@furria/ui/KkMasterDetail';
import { KkRetryAlert } from '@furria/ui/KkRetryAlert';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { AppListSkeleton } from '@/features/session/components/AppListSkeleton';
import { LOADING_LABEL, RETRY_LABEL } from '../board-hub-copy';
import { useBoardHub } from '../hooks/use-board-hub';
import { toBoardErrorMessage } from '../manage-board-messages';
import { BoardArchived } from './BoardArchived';
import { BoardHeld } from './BoardHeld';
import { BoardOpen } from './BoardOpen';
import { BoardSide } from './BoardSide';
import { BoardStrip } from './BoardStrip';

export const BoardBody: FC = () => {
  const hub = useBoardHub();

  if (hub.query.data === undefined) {
    const message = toBoardErrorMessage(hub.query.error);

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

  const isSideOpen = hub.isWide && (hub.selected !== null || hub.form.target !== null);
  const masterSpan = isSideOpen ? 7 : 12;
  const selectedId = hub.form.target?.boardOfficeId ?? hub.selected?.boardOfficeId ?? null;

  return (
    <Stack sx={{ gap: 2, minWidth: 0 }}>
      <BoardStrip
        summary={hub.summary}
        counts={hub.counts}
        filter={hub.filter}
        today={hub.today}
        onChoose={hub.chooseFilter}
      />
      <KkMasterDetail>
        <KkMasterDetail.Master span={masterSpan}>
          <Stack sx={{ gap: 2.5, minWidth: 0 }}>
            <BoardOpen
              items={hub.items}
              offices={hub.offices}
              filter={hub.filter}
              today={hub.today}
              canManageRoles={hub.canManageRoles}
              selectedId={selectedId}
              highlightedKey={hub.highlightedKey}
              onOpen={hub.open}
              onSeat={hub.form.openSeat}
            />
            <BoardHeld
              offices={hub.held}
              today={hub.today}
              compact={isSideOpen}
              selectedId={selectedId}
              highlightedKey={hub.highlightedKey}
              onOpen={hub.open}
            />
            <BoardArchived
              offices={hub.archived}
              compact={isSideOpen}
              selectedId={selectedId}
              highlightedKey={hub.highlightedKey}
              onOpen={hub.open}
            />
          </Stack>
        </KkMasterDetail.Master>
        <BoardSide
          offices={hub.offices}
          selected={hub.selected}
          form={hub.form}
          isWide={hub.isWide}
          today={hub.today}
          canManageRoles={hub.canManageRoles}
          onClose={hub.closePane}
        />
      </KkMasterDetail>
    </Stack>
  );
};
