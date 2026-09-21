import { KkFactRow, KkIconButton } from '@furria/ui';
import type { FC } from 'react';
import {
  RHYTHM_EDIT_ACTION_LABEL,
  RHYTHM_REMOVE_LABEL,
  toClockValue,
  toDurationLabel,
  toSlotVenueLine,
  toWeekdayLabel,
} from '../rhythm-labels';
import type { TrainingSlot } from '../schemas';

const META_SEPARATOR = ' · ';

interface HubRhythmRowProps {
  slot: TrainingSlot;
  canManage: boolean;
  venueIsArchived: boolean;
  onEdit: (groupTrainingSlotId: number) => void;
  onRemove: (groupTrainingSlotId: number) => void;
}

export const HubRhythmRow: FC<HubRhythmRowProps> = ({
  slot,
  canManage,
  venueIsArchived,
  onEdit,
  onRemove,
}) => {
  const edit = (): void => {
    onEdit(slot.groupTrainingSlotId);
  };

  const remove = (): void => {
    onRemove(slot.groupTrainingSlotId);
  };

  const meta = [
    toDurationLabel(slot.durationMinutes),
    toSlotVenueLine(slot.venueName, venueIsArchived),
  ].join(META_SEPARATOR);

  const tone = venueIsArchived ? 'gold' : 'neutral';

  const actions = canManage ? (
    <>
      <KkIconButton icon="edit" label={RHYTHM_EDIT_ACTION_LABEL} onClick={edit} />
      <KkIconButton icon="close" label={RHYTHM_REMOVE_LABEL} onClick={remove} />
    </>
  ) : undefined;

  return (
    <KkFactRow
      title={toWeekdayLabel(slot.weekday)}
      span={toClockValue(slot.startsAt)}
      spanLabel="ab"
      meta={meta}
      tone={tone}
      actions={actions}
    />
  );
};
