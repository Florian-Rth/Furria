import IconButton from '@mui/material/IconButton';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import type { KkScreenSearch } from '../../screen-declaration';
import { barSlot } from '../logic/bar-slot';
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
    sx={[barSlot, focusRing]}
  >
    <KkShellBarGlass />
  </IconButton>
);
