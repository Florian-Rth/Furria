import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import type { FC, MouseEvent } from 'react';

export interface KkPressToggleOption {
  id: string;
  label: string;
}

interface KkPressBarToggleProps {
  label: string;
  options: readonly KkPressToggleOption[];
  value: string;
  onChange: (id: string) => void;
}

export const KkPressBarToggle: FC<KkPressBarToggleProps> = ({
  label,
  options,
  value,
  onChange,
}) => {
  const choose = (_event: MouseEvent<HTMLElement>, next: string | null): void => {
    if (next !== null) {
      onChange(next);
    }
  };
  const buttons = options.map((option) => (
    <ToggleButton
      key={option.id}
      value={option.id}
      sx={{ px: 1.25, py: 0.5, typography: 'caption', fontWeight: 800, textTransform: 'none' }}
    >
      {option.label}
    </ToggleButton>
  ));

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      aria-label={label}
      value={value}
      onChange={choose}
      sx={{ flexShrink: 0 }}
    >
      {buttons}
    </ToggleButtonGroup>
  );
};
