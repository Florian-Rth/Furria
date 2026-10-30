import { KkPaneLayout } from '@furria/ui/KkPaneLayout';
import type { FC } from 'react';
import type { SeasonAct, SeasonEvening } from '@/features/season/schemas';
import type { SeasonPick } from '../hooks/use-season-a';
import { PANE_CLOSE, PANE_LABEL, toPaneMeta } from '../season-a-copy';
import { SeasonDetails } from './SeasonDetails';

interface SeasonDetailsPaneProps {
  pick: SeasonPick;
  onToggle: (act: SeasonAct, evening: SeasonEvening) => void;
  onClose: () => void;
}

export const SeasonDetailsPane: FC<SeasonDetailsPaneProps> = ({ pick, onToggle, onClose }) => {
  const meta = toPaneMeta(pick.evening.title, pick.evening.startsAt);
  const detailsKey = `${pick.act.actId}:${pick.evening.eventId}`;

  return (
    <KkPaneLayout.Pane label={PANE_LABEL}>
      <KkPaneLayout.PaneHead
        title={pick.act.name}
        meta={meta}
        closeLabel={PANE_CLOSE}
        onClose={onClose}
      />
      <KkPaneLayout.PaneBody>
        <SeasonDetails key={detailsKey} pick={pick} onToggle={onToggle} />
      </KkPaneLayout.PaneBody>
    </KkPaneLayout.Pane>
  );
};
