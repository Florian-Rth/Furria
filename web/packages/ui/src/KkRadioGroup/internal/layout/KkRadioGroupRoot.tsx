import RadioGroup from '@mui/material/RadioGroup';
import type { ChangeEvent, FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

const NO_CHOICE = '';

interface KkRadioGroupRootProps extends PropsWithChildren {
  name: string;
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  sx?: KkSx;
}

export const KkRadioGroupRoot: FC<KkRadioGroupRootProps> = ({
  name,
  label,
  value,
  onChange,
  sx,
  children,
}) => {
  const change = (_event: ChangeEvent<HTMLInputElement>, nextValue: string): void => {
    onChange(nextValue);
  };

  return (
    <RadioGroup
      name={name}
      aria-label={label}
      value={value ?? NO_CHOICE}
      onChange={change}
      data-kk-radio-group
      sx={[{ flexWrap: 'nowrap', gap: 1, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {children}
    </RadioGroup>
  );
};
