import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import type { ChangeEvent, FC } from 'react';
import { KkIcon } from './KkIcon';
import { KkIconButton } from './KkIconButton';
import type { KkSx } from './kk-sx';

const CLEAR_LABEL = 'Suche leeren';

interface KkSearchFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  sx?: KkSx;
}

export const KkSearchField: FC<KkSearchFieldProps> = ({
  name,
  label,
  value,
  onChange,
  placeholder,
  autoFocus,
  sx,
}) => {
  const change = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange(event.target.value);
  };

  const clear = (): void => {
    onChange('');
  };

  const startAdornment = (
    <InputAdornment position="start">
      <KkIcon name="search" size="small" sx={{ color: 'text.secondary' }} />
    </InputAdornment>
  );

  const endAdornment =
    value === '' ? undefined : (
      <InputAdornment position="end">
        <KkIconButton
          label={CLEAR_LABEL}
          icon="close"
          size="small"
          onClick={clear}
          sx={{ color: 'text.secondary' }}
        />
      </InputAdornment>
    );

  return (
    <TextField
      name={name}
      label={label}
      value={value}
      onChange={change}
      placeholder={placeholder}
      autoFocus={autoFocus}
      autoComplete="off"
      variant="outlined"
      fullWidth
      data-kk-search-field
      slotProps={{
        htmlInput: { inputMode: 'search' },
        input: { startAdornment, endAdornment },
      }}
      sx={[{ minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    />
  );
};
