import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { KkButtonTone } from '../../../KkButton';
import { KkButton } from '../../../KkButton';
import { kkTokens } from '../../../tokens';

interface KkWriteScreenLineProps {
  label: string;
  tone: KkButtonTone;
  onSelect: () => void;
}

export const KkWriteScreenLine: FC<KkWriteScreenLineProps> = ({ label, tone, onSelect }) => (
  <Stack
    data-kk-write-screen-line
    sx={{
      pt: 1.5,
      mt: 0.5,
      borderTopWidth: kkTokens.line.hair,
      borderTopStyle: 'solid',
      borderTopColor: 'divider',
    }}
  >
    <KkButton variant="text" tone={tone} fullWidth onClick={onSelect}>
      {label}
    </KkButton>
  </Stack>
);
