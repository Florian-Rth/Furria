import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { KkIcon } from './KkIcon';

interface KkDatelineProps {
  kicker: ReactNode;
  line: string;
  address: string;
  isAddressFixed: boolean;
  addressLabel: string;
}

export const KkDateline: FC<KkDatelineProps> = ({
  kicker,
  line,
  address,
  isAddressFixed,
  addressLabel,
}) => (
  <Stack
    direction="row"
    data-kk-dateline
    sx={{ gap: 1.5, rowGap: 0.75, alignItems: 'center', flexWrap: 'wrap', minWidth: 0 }}
  >
    {kicker}
    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
      {line}
    </Typography>
    <Stack
      direction="row"
      role="group"
      title={addressLabel}
      aria-label={`${address} – ${addressLabel}`}
      sx={{ gap: 0.5, alignItems: 'center', minWidth: 0, color: 'text.disabled' }}
    >
      <KkIcon name={isAddressFixed ? 'lock' : 'link'} size="small" />
      <Typography variant="caption" noWrap sx={{ fontWeight: 600 }}>
        {address}
      </Typography>
    </Stack>
  </Stack>
);
