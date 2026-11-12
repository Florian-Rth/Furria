import { KkNote } from '@furria/ui/KkNote';
import type { FC } from 'react';
import { useGroupMatcherHubContext } from '../group-matcher-hub-context';
import { GONE_NOTE } from '../group-matcher-hub-copy';
import type { GroupMatcherPane } from '../statement-pool';
import { resolvePane } from '../statement-pool';
import { StatementPane } from './StatementPane';

interface GroupMatcherPaneViewProps {
  pane: GroupMatcherPane | null;
  isOpen: boolean;
}

export const GroupMatcherPaneView: FC<GroupMatcherPaneViewProps> = ({ pane, isOpen }) => {
  const { pool } = useGroupMatcherHubContext();

  if (pane === null) {
    return null;
  }

  const resolved = resolvePane(pool, pane);

  switch (resolved.kind) {
    case 'statement':
      return <StatementPane statement={resolved.statement} index={resolved.index} />;
    case 'gone':
      return isOpen ? (
        <KkNote tone="muted" icon="info">
          {GONE_NOTE}
        </KkNote>
      ) : null;
  }
};
