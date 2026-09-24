import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KkButton } from '../../../KkButton';
import { kkTokens } from '../../../tokens';

interface KkWriteScreenDangerProps {
  label: string;
  onSelect: () => void;
}

export const KkWriteScreenDanger: FC<KkWriteScreenDangerProps> = ({ label, onSelect }) => (
  <Stack
    data-kk-write-screen-danger
    sx={{
      pt: 1.5,
      mt: 0.5,
      borderTopWidth: kkTokens.line.hair,
      borderTopStyle: 'solid',
      borderTopColor: 'divider',
    }}
  >
    <KkButton variant="text" tone="danger" fullWidth onClick={onSelect}>
      {label}
    </KkButton>
  </Stack>
);
