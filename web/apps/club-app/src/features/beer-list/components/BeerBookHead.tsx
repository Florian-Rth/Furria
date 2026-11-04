import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

interface BeerBookHeadProps {
  caption: string;
  title: string;
}

export const BeerBookHead: FC<BeerBookHeadProps> = ({ caption, title }) => (
  <Stack sx={{ flex: 1, minWidth: 0, gap: 0.25 }}>
    <KkText variant="caption" tone="secondary">
      {caption}
    </KkText>
    <KkText variant="subtitle2">{title}</KkText>
  </Stack>
);
