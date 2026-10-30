import { KkHall } from '@furria/ui/KkHall';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { CLOSE } from '../heute-c-copy';
import type { HeuteCState } from '../hooks/use-heute-c';

interface HeuteCHeadProps {
  heute: HeuteCState;
}

export const HeuteCHead: FC<HeuteCHeadProps> = ({ heute }) => (
  <Stack component="header" direction="row" sx={{ alignItems: 'center', gap: 1.5, minWidth: 0 }}>
    <KkHall.Close label={CLOSE} onPress={heute.close} />
    <KkText component="h1" variant="subtitle1" clamp={1} sx={{ flex: '1 1 50%', minWidth: 0 }}>
      {heute.heading}
    </KkText>
    <KkText variant="subtitle2" tone="secondary" clamp={1} sx={{ flexShrink: 1, minWidth: 0 }}>
      {heute.clock}
    </KkText>
  </Stack>
);
