import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import type { FC } from 'react';
import type { SeasonAct, SeasonEvening } from '@/features/season/schemas';
import type { SeasonPick } from '../hooks/use-season-a';
import { PANE_CLOSE, PANE_LABEL } from '../season-a-copy';
import { SeasonSheetBody } from './SeasonSheetBody';

interface SeasonDetailsSheetProps {
  pick: SeasonPick | null;
  onToggle: (act: SeasonAct, evening: SeasonEvening) => void;
  onClose: () => void;
}

export const SeasonDetailsSheet: FC<SeasonDetailsSheetProps> = ({ pick, onToggle, onClose }) => {
  const content =
    pick === null ? null : (
      <SeasonSheetBody
        key={`${pick.act.actId}:${pick.evening.eventId}`}
        pick={pick}
        onToggle={onToggle}
      />
    );

  return (
    <KkBottomDrawer
      open={pick !== null}
      label={PANE_LABEL}
      closeLabel={PANE_CLOSE}
      onClose={onClose}
    >
      {content}
    </KkBottomDrawer>
  );
};
