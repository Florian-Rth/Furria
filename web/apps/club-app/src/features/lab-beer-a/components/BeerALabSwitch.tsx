import { KkChoiceChips } from '@furria/ui/KkChoiceChips';
import { KkMeta } from '@furria/ui/KkMeta';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { LAB_SWITCH_LABEL } from '../beer-a-copy';

export interface BeerALabChoice {
  id: string;
  label: string;
}

interface BeerALabSwitchProps {
  choices: readonly BeerALabChoice[];
  value: string | null;
  onChange: (id: string) => void;
}

export const BeerALabSwitch: FC<BeerALabSwitchProps> = ({ choices, value, onChange }) => (
  <Stack component="aside" sx={{ gap: 0.75, mt: 4, minWidth: 0 }}>
    <KkMeta tone="faint">{LAB_SWITCH_LABEL}</KkMeta>
    <KkChoiceChips label={LAB_SWITCH_LABEL} choices={choices} value={value} onChange={onChange} />
  </Stack>
);
