import { KkMeta } from '@furria/ui/KkMeta';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { HeuteCCall } from '../hooks/use-heute-c';

interface HeuteCCallLineProps {
  call: HeuteCCall;
}

export const HeuteCCallLine: FC<HeuteCCallLineProps> = ({ call }) => (
  <Stack component="li" sx={{ minWidth: 0, py: 0.5 }}>
    <KkText variant="body2" clamp={1}>
      {call.name}
    </KkText>
    <KkMeta lines={1}>{call.meta}</KkMeta>
  </Stack>
);
