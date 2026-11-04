import { KkButton } from '@furria/ui/KkButton';
import { KkHeading } from '@furria/ui/KkHeading';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { DECLARE_CONFIRM, DECLARE_TITLE, declareText } from '../beer-a-copy';

interface BeerADeclarationProps {
  owner: string;
  size?: 'medium' | 'large';
  onConfirm: () => void;
}

export const BeerADeclaration: FC<BeerADeclarationProps> = ({
  owner,
  size = 'medium',
  onConfirm,
}) => (
  <KkPanel variant="block">
    <Stack sx={{ gap: 1.5, minWidth: 0 }}>
      <KkHeading level={3} component="h2">
        {DECLARE_TITLE}
      </KkHeading>
      <KkText variant="body2">{declareText(owner)}</KkText>
      <KkButton size={size} fullWidth onClick={onConfirm}>
        {DECLARE_CONFIRM}
      </KkButton>
    </Stack>
  </KkPanel>
);
