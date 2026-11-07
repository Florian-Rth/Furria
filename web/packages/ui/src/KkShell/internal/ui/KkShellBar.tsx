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

import { BAR_PADDING_X, FOLDED_SHIFT } from '../folded-bar';

const FOLDED_PAINT = {
  px: 0,
  ml: FOLDED_SHIFT,
  pointerEvents: 'none',
  borderColor: 'transparent',
  '&::before': { display: 'none' },
  '& a, & button': { pointerEvents: 'auto' },
  '& [data-kk-shell-bar-close] > :not([data-kk-shell-bar-mark])': { display: 'none' },
} as const;

interface KkShellBarProps {
  kind: KkScreenKind;
  folded: boolean;
  lead: KkShellBarLead;
  title: string;
  origin?: KkScreenOrigin;
  actions?: readonly KkScreenAction[];
  search?: KkScreenSearch;
  thread?: KkScreenThread;
}

export const KkShellBar: FC<KkShellBarProps> = ({
  kind,
  folded,
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
  const shownActions = folded ? undefined : actions;
  const profileLink = shownProfile === null ? null : <KkShellBarProfile profile={shownProfile} />;

  const row =
    searching && search !== undefined ? (
      <KkShellBarSearch search={search} />
    ) : (
      <KkShellBarRest
        key={scene.current.path}
        actions={shownActions}
        search={search}
        scene={scene}
        divided={shownProfile !== null}
      />
    );

  return (
    <KkChrome
      sx={[
        {
          position: 'relative',
          height: `${barHeight}px`,
          justifyContent: 'center',
          px: BAR_PADDING_X,
        },
        folded && FOLDED_PAINT,
      ]}
    >
      <Stack
        direction="row"
        data-kk-shell-bar-folded={folded}
        sx={{ alignItems: 'center', gap: 0.25, minWidth: 0 }}
      >
        {row}
        {profileLink}
      </Stack>
      {threadLine}
    </KkChrome>
  );
};
