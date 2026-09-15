import InputBase from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import type { ChangeEvent, FC, KeyboardEvent } from 'react';
import { KkIcon } from '../../../KkIcon';
import { KkIconButton } from '../../../KkIconButton';
import { kkTokens } from '../../../tokens';
import type { KkScreenSearch } from '../../screen-declaration';

const CANCEL_KEY = 'Escape';
const FIELD_SIZE = '1rem';

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
      <KkIcon name="search" size="small" sx={{ color: 'text.secondary', flexShrink: 0 }} />
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
          fontFamily: kkTokens.font.body,
          fontSize: FIELD_SIZE,
          color: 'text.primary',
        }}
      />
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
    </Stack>
  );
};
