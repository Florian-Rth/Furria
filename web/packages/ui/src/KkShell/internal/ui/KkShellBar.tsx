import type { FC } from 'react';
import { KkChrome } from '../../../internal/KkChrome';
import { kkTokens } from '../../../tokens';
import type {
  KkScreenAction,
  KkScreenKind,
  KkScreenOrigin,
  KkScreenSearch,
  KkScreenThread,
} from '../../screen-declaration';
import { useKkShell } from '../logic/shell-context';
import type { KkShellBarLead } from './KkShellBarLeading';
import { KkShellBarRest } from './KkShellBarRest';
import { KkShellBarSearch } from './KkShellBarSearch';
import { KkShellThread } from './KkShellThread';

const { barHeight } = kkTokens.shell;
const BAR_PADDING_X = 1.25;

interface KkShellBarProps {
  kind: KkScreenKind;
  lead: KkShellBarLead;
  title: string;
  origin?: KkScreenOrigin;
  actions?: readonly KkScreenAction[];
  search?: KkScreenSearch;
  thread?: KkScreenThread;
}

export const KkShellBar: FC<KkShellBarProps> = ({
  kind,
  lead,
  title,
  origin,
  actions,
  search,
  thread,
}) => {
  const { density } = useKkShell();
  const threadLine = thread === undefined ? null : <KkShellThread thread={thread} />;

  const searching = search !== undefined && search.query !== null;

  const row =
    searching && search !== undefined ? (
      <KkShellBarSearch search={search} />
    ) : (
      <KkShellBarRest
        kind={kind}
        lead={lead}
        title={title}
        origin={origin}
        actions={actions}
        search={search}
      />
    );

  return (
    <KkChrome
      density={density}
      component="header"
      sx={{
        position: 'relative',
        height: `${barHeight}px`,
        justifyContent: 'center',
        px: BAR_PADDING_X,
      }}
    >
      {row}
      {threadLine}
    </KkChrome>
  );
};
