import { useIsWideScreen } from '@furria/ui/use-is-wide-screen';
import { useChildMatches, useNavigate } from '@tanstack/react-router';
import { useCloseOnEscape } from '@/lib/use-close-on-escape';
import { useStatementPoolQuery } from '../api';
import type { GroupMatcherHubView } from '../group-matcher-hub-context';
import { toHubErrorMessage } from '../group-matcher-hub-copy';
import { groupMatcherPaneOf } from '../statement-pool';
import { useGroupMatcherOperations } from './use-group-matcher-operations';

export type GroupMatcherHubState =
  | { kind: 'loading' }
  | { kind: 'failed'; message: string; isRetrying: boolean; retry: () => void }
  | { kind: 'ready'; view: GroupMatcherHubView };

export const useGroupMatcherHub = (): GroupMatcherHubState => {
  const query = useStatementPoolQuery();
  const isWide = useIsWideScreen();
  const navigate = useNavigate();
  const pane = groupMatcherPaneOf(useChildMatches()[0]);

  const closePane = (): void => {
    void navigate({ to: '/manage/group-matcher', resetScroll: false });
  };

  const operations = useGroupMatcherOperations(pane, closePane);

  useCloseOnEscape(isWide && pane !== null && operations.deleteTarget === null, closePane);

  const pool = query.data;
  const message = toHubErrorMessage(query.error);

  if (pool !== undefined) {
    return {
      kind: 'ready',
      view: {
        pool,
        pane,
        isWide,
        operations,
        closePane,
        openProposal: (statementId) => {
          void navigate({
            to: '/manage/group-matcher/proposals/$statementId',
            params: { statementId: String(statementId) },
            resetScroll: false,
          });
        },
        openStatement: (statementId) => {
          void navigate({
            to: '/manage/group-matcher/statements/$statementId',
            params: { statementId: String(statementId) },
            resetScroll: false,
          });
        },
      },
    };
  }

  if (message !== null) {
    return {
      kind: 'failed',
      message,
      isRetrying: query.isFetching,
      retry: () => {
        void query.refetch();
      },
    };
  }

  return { kind: 'loading' };
};
