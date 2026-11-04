import { KkButton } from '@furria/ui/KkButton';
import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkRule } from '@furria/ui/KkRule';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { LAB_EMPTY_STOCK, LAB_SWITCH_LABEL } from '../ledger-copy';
import type { LedgerViewer } from '../schemas';
import { LEDGER_VIEWERS } from '../schemas';

interface LabViewerSwitchProps {
  path: string;
  viewer: LedgerViewer;
  viewers?: readonly LedgerViewer[];
  onEmptyStock: () => void;
}

export const LabViewerSwitch: FC<LabViewerSwitchProps> = ({
  path,
  viewer,
  viewers = LEDGER_VIEWERS,
  onEmptyStock,
}) => {
  const links = viewers.map((key) => {
    const search = { as: key };
    const variant = key === viewer ? 'contained' : 'text';

    return (
      <KkButton key={key} variant={variant} size="small" component={Link} to={path} search={search}>
        {key}
      </KkButton>
    );
  });

  return (
    <Stack component="aside" aria-label={LAB_SWITCH_LABEL} data-lab-switch sx={{ gap: 0.75 }}>
      <KkRule />
      <KkEyebrow tone="muted">{LAB_SWITCH_LABEL}</KkEyebrow>
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
        {links}
        <KkButton variant="text" size="small" onClick={onEmptyStock}>
          {LAB_EMPTY_STOCK}
        </KkButton>
      </Stack>
    </Stack>
  );
};
