import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import type { Theme } from '@mui/material/styles';
import type { ChangeEvent, FC } from 'react';
import { inlinePaint } from './kk-studio-i-inline-paint';

interface KkStudioIHeadNameProps {
  value: string;
  label: string;
  onChange: (value: string) => void;
}

export const KkStudioIHeadName: FC<KkStudioIHeadNameProps> = ({ value, label, onChange }) => {
  const change = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange(event.target.value);
  };

  return (
    <Box component="h2" sx={{ m: 0, minWidth: 0 }}>
      <InputBase
        value={value}
        onChange={change}
        slotProps={{ input: { 'aria-label': label } }}
        data-kk-studio-i-name
        sx={(theme: Theme) => ({ ...inlinePaint(theme), typography: 'h3', p: 0 })}
      />
    </Box>
  );
};
