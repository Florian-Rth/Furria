import IconButton from '@mui/material/IconButton';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';
import type { KkScreenSearch } from '../../screen-declaration';
import { KkShellBarGlass } from './KkShellBarGlass';

interface KkShellBarSearchOpenerProps {
  search: KkScreenSearch;
}

export const KkShellBarSearchOpener: FC<KkShellBarSearchOpenerProps> = ({ search }) => (
  <IconButton
    aria-label={search.openLabel}
    type="button"
    onClick={search.onOpen}
    data-kk-shell-bar-search-opener
    sx={(theme) => ({
      minWidth: kkTokens.tapTarget,
      minHeight: kkTokens.tapTarget,
      flexShrink: 0,
      ...focusRing(theme),
    })}
  >
    <KkShellBarGlass />
  </IconButton>
);
