import { KkPaneLayout } from '@furria/ui/KkPaneLayout';
import type { FC } from 'react';
import type { SeasonCSelection } from '../hooks/use-season-c';
import { CLOSE, PANE_LABEL } from '../season-c-copy';
import { SeasonCPaneContent } from './SeasonCPaneContent';

interface SeasonCPaneProps {
  selection: SeasonCSelection;
  onClose: () => void;
}

export const SeasonCPane: FC<SeasonCPaneProps> = ({ selection, onClose }) => (
  <KkPaneLayout.Pane label={PANE_LABEL}>
    <KkPaneLayout.PaneHead title={selection.act.name} closeLabel={CLOSE} onClose={onClose} />
    <KkPaneLayout.PaneBody>
      <SeasonCPaneContent selection={selection} />
    </KkPaneLayout.PaneBody>
  </KkPaneLayout.Pane>
);
