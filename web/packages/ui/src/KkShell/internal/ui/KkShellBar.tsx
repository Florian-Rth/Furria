import type { FC } from 'react';
import { KkChrome } from '../../../internal/KkChrome';
import { kkTokens } from '../../../tokens';
import type { KkBarMorph } from '../../bar-morph';
import type {
  KkScreenAction,
  KkScreenKind,
  KkScreenOrigin,
  KkScreenSearch,
  KkScreenThread,
} from '../../screen-declaration';
import { useKkShell } from '../logic/shell-context';
import { useBarScene } from '../logic/use-bar-scene';
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
  morph: KkBarMorph | null;
}

export const KkShellBar: FC<KkShellBarProps> = ({
  kind,
  lead,
  title,
  origin,
  actions,
  search,
  thread,
  morph,
}) => {
  const { path } = useKkShell();
  const scene = useBarScene({ path, kind, lead, title, origin: origin ?? null });
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
        morph={morph}
        scene={scene}
      />
    );

  const bar = (
    <KkChrome
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

  if (morph?.Bar === undefined) {
    return bar;
  }

  return <morph.Bar scene={scene}>{bar}</morph.Bar>;
};
