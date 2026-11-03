import { KkGroupToneDot } from '@furria/ui/KkGroupToneDot';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { GroupTone } from '@/features/groups/group-identity';
import { toToneLabel } from '@/lib/group-tone';

const NO_TONE_LABEL = 'noch keine';

interface HubToneValueProps {
  tone: GroupTone | null;
}

export const HubToneValue: FC<HubToneValueProps> = ({ tone }) => {
  const label = tone === null ? NO_TONE_LABEL : toToneLabel(tone);

  return (
    <Stack component="span" direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
      <KkGroupToneDot tone={tone} />
      {label}
    </Stack>
  );
};
