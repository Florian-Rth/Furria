import { KkButton } from '@furria/ui/KkButton';
import { KkConfettiBurst } from '@furria/ui/KkConfettiBurst';
import { KkNote } from '@furria/ui/KkNote';
import type { KkSegmentSwitchItem } from '@furria/ui/KkSegmentSwitch';
import { KkSegmentSwitch } from '@furria/ui/KkSegmentSwitch';
import { KkText } from '@furria/ui/KkText';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { PourMemberList } from '../hooks/use-pour-member-list';
import {
  FILTER_ALL,
  FILTER_LABEL,
  FILTER_MINE,
  FORMER_LINE,
  olderLabelOf,
  STREAM_EMPTY,
  STREAM_MINE_EMPTY,
} from '../pour-member-copy';
import type { PourFilter } from '../pour-stream';
import { PourStreamDay } from './PourStreamDay';

const FILTER_ITEMS: readonly KkSegmentSwitchItem[] = [
  { id: 'all', label: FILTER_ALL, icon: 'club', count: null, countLabel: '' },
  { id: 'mine', label: FILTER_MINE, icon: 'person', count: null, countLabel: '' },
];

const isFilter = (id: string): id is PourFilter => id === 'all' || id === 'mine';

interface PourMemberBodyProps {
  list: PourMemberList;
  owner: string;
}

export const PourMemberBody: FC<PourMemberBodyProps> = ({ list, owner }) => {
  const enrolled = list.member.standing === 'enrolled';
  const choose = (id: string): void => {
    if (isFilter(id)) {
      list.chooseFilter(id);
    }
  };
  const lead = enrolled ? (
    <KkSegmentSwitch
      label={FILTER_LABEL}
      items={FILTER_ITEMS}
      value={list.filter}
      onChange={choose}
    />
  ) : (
    <KkNote tone="muted" icon="info">
      {FORMER_LINE}
    </KkNote>
  );
  const emptyText = list.filter === 'mine' || !enrolled ? STREAM_MINE_EMPTY : STREAM_EMPTY;
  const empty =
    list.days.length === 0 ? (
      <KkText variant="body2" tone="secondary">
        {emptyText}
      </KkText>
    ) : null;
  const days = list.days.map((day) => (
    <PourStreamDay
      key={day.dayKey}
      day={day}
      todayKey={list.todayKey}
      owner={owner}
      freshIds={list.freshIds}
    />
  ));

  const olderLabel = olderLabelOf(list.hiddenDays);
  const older =
    list.hiddenDays === 0 ? null : (
      <KkButton variant="text" onClick={list.showOlder}>
        {olderLabel}
      </KkButton>
    );

  return (
    <Stack sx={{ gap: 1, minWidth: 0 }}>
      {lead}
      <Box sx={{ position: 'relative', height: 0 }}>
        <KkConfettiBurst fireKey={list.confettiKey} count={28} alwaysPlays />
      </Box>
      {empty}
      <Stack sx={{ gap: 0.5, minWidth: 0 }}>{days}</Stack>
      {older}
    </Stack>
  );
};
