import InputBase from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import { motion } from 'motion/react';
import type { ChangeEvent, CSSProperties, FC, KeyboardEvent } from 'react';
import { KkIconButton } from '../../../KkIconButton';
import { kkTokens } from '../../../tokens';
import type { KkScreenSearch } from '../../screen-declaration';
import { FIELD_READY, FIELD_WAITING } from '../logic/bar-search-motion';
import { KkShellBarGlass } from './KkShellBarGlass';
import { KkShellBarRule } from './KkShellBarRule';

const CANCEL_KEY = 'Escape';

const UNFURLING: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  flex: 1,
  minWidth: 0,
};

interface KkShellBarSearchProps {
  search: KkScreenSearch;
}

export const KkShellBarSearch: FC<KkShellBarSearchProps> = ({ search }) => {
  const change = (event: ChangeEvent<HTMLInputElement>): void => {
    search.onChange(event.target.value);
  };

  const cancelOnEscape = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === CANCEL_KEY) {
      search.onClose();
    }
  };

  return (
    <Stack
      direction="row"
      data-kk-shell-bar-search
      sx={{ alignItems: 'center', gap: 0.75, flex: 1, minWidth: 0 }}
    >
      <KkShellBarGlass />
      <motion.div style={UNFURLING} initial={FIELD_WAITING} animate={FIELD_READY}>
        <Stack sx={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <InputBase
            autoFocus
            value={search.query ?? ''}
            onChange={change}
            onKeyDown={cancelOnEscape}
            placeholder={search.placeholder}
            slotProps={{ input: { 'aria-label': search.openLabel, inputMode: 'search' } }}
            sx={{
              flex: 1,
              minWidth: 0,
              typography: 'body1',
              color: 'text.primary',
            }}
          />
          <KkShellBarRule />
        </Stack>
        <KkIconButton
          label={search.cancelLabel}
          icon="close"
          onClick={search.onClose}
          sx={{
            flexShrink: 0,
            minWidth: kkTokens.tapTarget,
            minHeight: kkTokens.tapTarget,
            color: 'text.secondary',
          }}
        />
      </motion.div>
    </Stack>
  );
};
