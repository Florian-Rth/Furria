import Box from '@mui/material/Box';
import type { FC } from 'react';
import { KkEyebrow } from '../KkEyebrow';

const REQUIRED_MARK = ' *';

interface KkFieldLabelProps {
  label: string;
  required: boolean;
}

export const KkFieldLabel: FC<KkFieldLabelProps> = ({ label, required }) => {
  const mark = required ? (
    <Box component="span" data-kk-required-mark>
      {REQUIRED_MARK}
    </Box>
  ) : null;

  return (
    <KkEyebrow tone="muted">
      {label}
      {mark}
    </KkEyebrow>
  );
};
