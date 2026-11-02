import { KkButton } from '@furria/ui/KkButton';
import { KkIcon } from '@furria/ui/KkIcon';
import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkTouchLab } from '@furria/ui/KkTouchLab';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { LabTransport } from '../hooks/use-timeline-playground';
import { FIT, PAUSE, PLAY, UNDO } from '../studio-lab-copy';

interface LabTransportBarProps {
  transport: LabTransport;
}

const playIcon = <KkIcon name="play" size="small" />;

export const LabTransportBar: FC<LabTransportBarProps> = ({ transport }) => {
  const label = transport.playing ? PAUSE : PLAY;
  const time =
    typeof transport.time === 'string' ? (
      <KkTouchLab.Hint text={transport.time} numeric sx={{ flex: 1 }} />
    ) : (
      <KkTouchLab.Clock time={transport.time} sx={{ flex: 1 }} />
    );
  const fit =
    transport.fit === null ? null : (
      <KkIconButton label={FIT} icon="zoom" onClick={transport.fit} />
    );
  const undo =
    transport.undo === null ? null : (
      <KkIconButton
        label={UNDO}
        icon="undo"
        disabled={!transport.canUndo}
        onClick={transport.undo}
      />
    );

  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
      <KkButton variant="contained" size="small" startIcon={playIcon} onClick={transport.toggle}>
        {label}
      </KkButton>
      {time}
      {fit}
      {undo}
    </Stack>
  );
};
