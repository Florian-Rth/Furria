import type { VisitHistory } from '@furria/studio/visit-history';
import { KkEjPanel } from '@furria/ui/KkEjPanel';
import type { FC } from 'react';
import { EJ_HISTORY_VISIT } from '../edit-jobs-copy';
import type { EjVersions } from '../hooks/use-ej-versions';
import { EjHistoryList } from './EjHistoryList';
import { EjVersionsSection } from './EjVersionsSection';

interface EjHistoryPanelProps {
  history: VisitHistory;
  versions: EjVersions;
}

export const EjHistoryPanel: FC<EjHistoryPanelProps> = ({ history, versions }) => (
  <>
    <KkEjPanel.Group label={EJ_HISTORY_VISIT}>
      <KkEjPanel.GroupHead text={EJ_HISTORY_VISIT} aside={null} />
      <EjHistoryList history={history} />
    </KkEjPanel.Group>
    <EjVersionsSection versions={versions} />
  </>
);
