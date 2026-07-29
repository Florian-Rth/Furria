import Button from '@mui/material/Button';
import type { FC } from 'react';

interface KompassChoiceButtonProps {
  label: string;
  onSelect: () => void;
}

export const KompassChoiceButton: FC<KompassChoiceButtonProps> = ({ label, onSelect }) => (
  <Button variant="outlined" size="large" onClick={onSelect} sx={{ minWidth: '7rem' }}>
    {label}
  </Button>
);
