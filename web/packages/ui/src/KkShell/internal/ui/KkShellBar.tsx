import Stack from '@mui/material/Stack';
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
import { useBarScene } from '../logic/use-bar-scene';
import type { KkShellBarLead } from './KkShellBarLeading';
import { KkShellBarProfile } from './KkShellBarProfile';
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
  const { path, profile } = useKkShell();
  const scene = useBarScene({ path, kind, lead, title, origin: origin ?? null });
  const threadLine = thread === undefined ? null : <KkShellThread thread={thread} />;

  const searching = search !== undefined && search.query !== null;
  const shownProfile = searching || kind === 'fullscreen' ? null : profile;
  const profileLink = shownProfile === null ? null : <KkShellBarProfile profile={shownProfile} />;

  const row =
    searching && search !== undefined ? (
      <KkShellBarSearch search={search} />
    ) : (
      <KkShellBarRest
        key={scene.current.path}
        actions={actions}
        search={search}
        scene={scene}
        divided={shownProfile !== null}
      />
    );

  return (
    <KkChrome
      component="header"
      sx={{
        position: 'relative',
        height: `${barHeight}px`,
        justifyContent: 'center',
        px: BAR_PADDING_X,
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.25, minWidth: 0 }}>
        {row}
        {profileLink}
      </Stack>
      {threadLine}
    </KkChrome>
  );
};
