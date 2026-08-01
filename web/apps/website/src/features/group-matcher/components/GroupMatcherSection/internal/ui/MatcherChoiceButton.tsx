import Button from '@mui/material/Button';
import type { FC } from 'react';

interface MatcherChoiceButtonProps {
  label: string;
  onSelect: () => void;
}

export const MatcherChoiceButton: FC<MatcherChoiceButtonProps> = ({ label, onSelect }) => (
  <Button variant="outlined" size="large" onClick={onSelect} sx={{ minWidth: '7rem' }}>
    {label}
  </Button>
);
