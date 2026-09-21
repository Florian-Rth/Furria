import { KkFactRow, KkIconButton } from '@furria/ui';
import type { FC } from 'react';
import {
  RHYTHM_EDIT_ACTION_LABEL,
  RHYTHM_REMOVE_LABEL,
  toClockValue,
  toDurationLabel,
  toWeekdayLabel,
} from '../rhythm-labels';
import type { TrainingSlot } from '../schemas';

const NO_VENUE_LINE = 'Ohne Ort';
const META_SEPARATOR = ' · ';

interface HubRhythmRowProps {
  slot: TrainingSlot;
  canManage: boolean;
  onEdit: (groupTrainingSlotId: number) => void;
  onRemove: (groupTrainingSlotId: number) => void;
}

export const HubRhythmRow: FC<HubRhythmRowProps> = ({ slot, canManage, onEdit, onRemove }) => {
  const edit = (): void => {
    onEdit(slot.groupTrainingSlotId);
  };

  const remove = (): void => {
    onRemove(slot.groupTrainingSlotId);
  };

  const meta = [toDurationLabel(slot.durationMinutes), slot.venueName ?? NO_VENUE_LINE].join(
    META_SEPARATOR,
  );

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
      actions={actions}
    />
  );
};
