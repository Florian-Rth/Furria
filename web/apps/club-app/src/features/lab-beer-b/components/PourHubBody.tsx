import { KkMasterDetail } from '@furria/ui/KkMasterDetail';
import { KkNote } from '@furria/ui/KkNote';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { PourHub } from '../hooks/use-pour-hub';
import { noticeTextOf } from '../pour-hub-copy';
import { PourHubFilters } from './PourHubFilters';
import { PourHubHead } from './PourHubHead';
import { PourHubRoster } from './PourHubRoster';
import { PourHubSide } from './PourHubSide';
import { PourJournal } from './PourJournal';

interface PourHubBodyProps {
  hub: PourHub;
}

const ROSTER_SPAN = 5;

const ROSTER_FOCUSES = new Set(['open', 'overdue', 'people']);

export const PourHubBody: FC<PourHubBodyProps> = ({ hub }) => {
  const masterSpan = hub.isWide ? 7 : 12;
  const selectedId = hub.side?.kind === 'person' ? hub.side.personId : null;
  const openPerson = (personId: number): void => {
    hub.openSide({ kind: 'person', personId });
  };
  const noticeText = hub.notice === null ? null : noticeTextOf(hub.notice);
  const notice =
    noticeText === null ? null : (
      <KkNote tone="info" icon="checkCircle">
        {noticeText}
      </KkNote>
    );
  const rosterList = (
    <PourHubRoster rows={hub.focusRoster} selectedId={selectedId} onOpen={openPerson} />
  );
  const roster = !hub.isWide && ROSTER_FOCUSES.has(hub.focus) ? rosterList : null;
  const side =
    hub.isWide && hub.side === null ? (
      <KkMasterDetail.Detail span={ROSTER_SPAN}>{rosterList}</KkMasterDetail.Detail>
    ) : (
      <PourHubSide hub={hub} />
    );

  return (
    <Stack sx={{ gap: 2, minWidth: 0 }}>
      <PourHubHead hub={hub} />
      {notice}
      <KkMasterDetail>
        <KkMasterDetail.Master span={masterSpan}>
          <Stack sx={{ gap: 2, minWidth: 0 }}>
            {roster}
            <PourHubFilters hub={hub} />
            <PourJournal
              days={hub.days}
              todayKey={hub.todayKey}
              selectedId={selectedId}
              onOpen={openPerson}
            />
          </Stack>
        </KkMasterDetail.Master>
        {side}
      </KkMasterDetail>
    </Stack>
  );
};
