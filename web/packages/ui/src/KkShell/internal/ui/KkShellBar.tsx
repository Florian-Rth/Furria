import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KkChrome } from '../../../internal/KkChrome';
import { kkTokens } from '../../../tokens';
import type {
  KkScreenAction,
  KkScreenOrigin,
  KkScreenSearch,
  KkScreenThread,
} from '../../screen-declaration';
import { useKkShell } from '../logic/shell-context';
import type { KkShellBarLead } from './KkShellBarLeading';
import { KkShellBarLeading } from './KkShellBarLeading';
import { KkShellBarSearch } from './KkShellBarSearch';
import { KkShellBarTrailing } from './KkShellBarTrailing';
import { KkShellThread } from './KkShellThread';

const { barHeight } = kkTokens.shell;
const BAR_PADDING_X = 1.25;

interface KkShellBarProps {
  lead: KkShellBarLead;
  title: string;
  origin?: KkScreenOrigin;
  actions?: readonly KkScreenAction[];
  search?: KkScreenSearch;
  thread?: KkScreenThread;
}

export const KkShellBar: FC<KkShellBarProps> = ({
  lead,
  title,
  origin,
  actions,
  search,
  thread,
}) => {
  const { density } = useKkShell();
  const threadLine = thread === undefined ? null : <KkShellThread thread={thread} />;

  const row =
    search !== undefined && search.query !== null ? (
      <KkShellBarSearch search={search} />
    ) : (
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, minWidth: 0 }}
      >
        <KkShellBarLeading lead={lead} title={title} origin={origin} />
        <KkShellBarTrailing search={search} actions={actions} />
      </Stack>
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
