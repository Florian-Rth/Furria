import { KkFocusPop } from '@furria/ui/KkFocusPop';
import type { FC } from 'react';
import { FOCUS_HISTORY, FOCUS_HISTORY_EMPTY, FOCUS_HISTORY_TITLE } from '../focus-copy';
import type { FocusHistory } from '../hooks/use-focus-editor';

interface FocusHistoryPopProps {
  history: FocusHistory;
}

export const FocusHistoryPop: FC<FocusHistoryPopProps> = ({ history }) => {
  const rows = history.rows.map((row, index) => {
    const meta = row.hint === undefined ? row.meta : `${row.meta} · ${row.hint}`;
    const lead = String(history.rows.length - index);

    return <KkFocusPop.Row key={row.key} lead={lead} text={row.label} meta={meta} state="plain" />;
  });
  const list = rows.length === 0 ? <KkFocusPop.Note text={FOCUS_HISTORY_EMPTY} /> : rows;
  const count = String(history.rows.length);

  return (
    <KkFocusPop
      glyph="history"
      text={count}
      label={FOCUS_HISTORY}
      title={FOCUS_HISTORY_TITLE}
      tone="plain"
      open={history.open}
      onOpen={history.show}
      onClose={history.hide}
    >
      {list}
    </KkFocusPop>
  );
};
