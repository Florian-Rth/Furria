import { KkAnswerChoice, KkAnswerRow } from '@furria/ui';
import type { FC } from 'react';
import { ATTENDANCE_LABELS } from '@/lib/calendar-copy';
import { useOwedRow } from '../hooks/use-owed-row';
import type { StartBoard } from '../hooks/use-start-view';
import type { StartEntry } from '../schemas';

interface OwedRowProps {
  entry: StartEntry;
  board: StartBoard;
}

export const OwedRow: FC<OwedRowProps> = ({ entry, board }) => {
  const row = useOwedRow(entry, board);

  return (
    <KkAnswerRow
      title={row.title}
      when={row.when}
      image={row.image}
      tone={row.tone}
      icon={row.icon}
    >
      <KkAnswerChoice
        label={row.choiceLabel}
        value={row.value}
        onChange={row.choose}
        labels={ATTENDANCE_LABELS}
        error={row.error}
        disabled={row.disabled}
      />
    </KkAnswerRow>
  );
};
