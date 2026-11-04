import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkFilterChips } from '@furria/ui/KkFilterChips';
import type { KkSx } from '@furria/ui/kk-sx';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { LAB_SWITCH_LABEL, VIEWER_LABELS } from '../pour-copy';
import type { PourLabOption, PourViewer } from '../schemas';

interface PourViewerSwitchProps {
  viewers: readonly PourViewer[];
  value: string;
  extra?: readonly PourLabOption[];
  onChange: (id: string) => void;
  sx?: KkSx;
}

export const PourViewerSwitch: FC<PourViewerSwitchProps> = ({
  viewers,
  value,
  extra = [],
  onChange,
  sx,
}) => {
  const options = [...viewers.map((id) => ({ id, label: VIEWER_LABELS[id] })), ...extra];

  return (
    <Stack component="aside" sx={[{ gap: 0.75 }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <KkEyebrow tone="muted">{LAB_SWITCH_LABEL}</KkEyebrow>
      <KkFilterChips label={LAB_SWITCH_LABEL} options={options} value={value} onChange={onChange} />
    </Stack>
  );
};
