import { KkOfficeMark } from '@furria/ui/KkOfficeMark';
import { KkSuccession } from '@furria/ui/KkSuccession';
import { KkWorkQueue } from '@furria/ui/KkWorkQueue';
import type { FC } from 'react';
import { toLandingKey } from '@/features/write/landing-target';
import { toInitials } from '@/lib/initials';
import type { QueueItem } from '../board-hub';
import { firstDayAfter, OFFICE_LANDING_KIND, queueActionOf } from '../board-hub';
import { INCOMING_NOTE, OPEN_OFFICE_LABEL, toActionLabel, toQueueRowView } from '../board-hub-copy';
import { toPersonName } from '../manage-board-labels';
import type { BoardOffice } from '../schemas';

interface BoardItemRowProps {
  item: QueueItem;
  office: BoardOffice;
  today: string;
  canSeat: boolean;
  selected: boolean;
  highlightedKey: string | null;
  onOpen: (boardOfficeId: number) => void;
  onSeat: (boardOfficeId: number, sinceOn: string) => void;
}

export const BoardItemRow: FC<BoardItemRowProps> = ({
  item,
  office,
  today,
  canSeat,
  selected,
  highlightedKey,
  onOpen,
  onSeat,
}) => {
  const view = toQueueRowView(item, today);
  const action = queueActionOf(item, canSeat);
  const landing = toLandingKey(OFFICE_LANDING_KIND, office.boardOfficeId);
  const open = (): void => {
    onOpen(office.boardOfficeId);
  };
  const seat = (): void => {
    onSeat(office.boardOfficeId, firstDayAfter(item, today));
  };
  const actionLabel = action === null ? '' : toActionLabel(action);
  const button =
    action === null ? undefined : (
      <KkWorkQueue.Action icon="add" label={actionLabel} onSelect={seat} />
    );
  const outgoing =
    item.kind === 'handover' && item.outgoing !== null
      ? {
          initials: toInitials(item.outgoing.firstName, item.outgoing.lastName),
          name: toPersonName(item.outgoing),
        }
      : null;
  const incomingNote = outgoing === null ? INCOMING_NOTE : undefined;
  const incoming =
    item.kind === 'handover'
      ? {
          initials: toInitials(item.incoming.firstName, item.incoming.lastName),
          name: toPersonName(item.incoming),
        }
      : null;
  const fact =
    incoming === null ? (
      view.fact
    ) : (
      <KkSuccession outgoing={outgoing} incoming={incoming} incomingNote={incomingNote} />
    );
  const mark = <KkOfficeMark icon={office.icon} state={view.mark} />;
  const whenTone = view.attention ? 'attention' : 'ink';

  return (
    <KkWorkQueue.Row
      mark={mark}
      title={office.name}
      fact={fact}
      day={view.day}
      relative={view.relative}
      whenTone={whenTone}
      action={button}
      openLabel={OPEN_OFFICE_LABEL}
      selected={selected}
      landing={landing}
      highlight={highlightedKey === landing}
      onOpen={open}
    />
  );
};
