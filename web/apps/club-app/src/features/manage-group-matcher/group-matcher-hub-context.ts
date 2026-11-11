import { createContext, useContext } from 'react';
import type { GroupMatcherOperations } from './hooks/use-group-matcher-operations';
import type { StatementPool } from './schemas';
import type { GroupMatcherPane } from './statement-pool';

export interface GroupMatcherHubView {
  pool: StatementPool;
  pane: GroupMatcherPane | null;
  isWide: boolean;
  operations: GroupMatcherOperations;
  closePane: () => void;
  openStatement: (statementId: number) => void;
}

export const GroupMatcherHubContext = createContext<GroupMatcherHubView | null>(null);

export const useGroupMatcherHubContext = (): GroupMatcherHubView => {
  const hub = useContext(GroupMatcherHubContext);

  if (hub === null) {
    throw new Error('useGroupMatcherHubContext must be used inside GroupMatcherHubContext');
  }

  return hub;
};
