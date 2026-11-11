import Box from '@mui/material/Box';
import type { FC } from 'react';
import { KkEyebrow } from '../../../KkEyebrow';

const REQUIRED_MARK = ' *';
const NOTE_SEPARATOR = ' · ';

interface KkMomentFieldLabelProps {
  label: string;
  required?: boolean;
  note?: string | null;
}

export const KkMomentFieldLabel: FC<KkMomentFieldLabelProps> = ({
  label,
  required = false,
  note = null,
}) => {
  const mark = required ? (
    <Box component="span" data-kk-required-mark>
      {REQUIRED_MARK}
    </Box>
  ) : null;
  const noteText =
    note === null ? null : (
      <Box component="span" data-kk-moment-field-note sx={{ color: 'text.primary' }}>
        {NOTE_SEPARATOR}
        {note}
      </Box>
    );

  return (
    <KkEyebrow tone="muted">
      {label}
      {mark}
      {noteText}
    </KkEyebrow>
  );
};
