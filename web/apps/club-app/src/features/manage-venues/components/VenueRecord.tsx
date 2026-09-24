import { KkHeading, KkMeta, KkNote, KkPanel } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { ElementType, FC, ReactNode } from 'react';
import { VENUE_WITHOUT_ADDRESS } from '../manage-venues-labels';

interface VenueRecordProps {
  name: string;
  addressLine: string | null;
  hint: string | null;
  note: string | null;
  dimmed: boolean;
  actions?: ReactNode;
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  highlight?: boolean;
  landing?: string;
}

export const VenueRecord: FC<VenueRecordProps> = ({
  name,
  addressLine,
  hint,
  note,
  dimmed,
  actions,
  component,
  to,
  params,
  highlight = false,
  landing,
}) => {
  const addressText = addressLine ?? VENUE_WITHOUT_ADDRESS;
  const hintLine = hint === null ? null : <KkMeta italic>{hint}</KkMeta>;
  const noteLine = note === null ? null : <KkNote>{note}</KkNote>;

  return (
    <KkPanel
      variant="block"
      dimmed={dimmed}
      component={component}
      to={to}
      params={params}
      highlight={highlight}
      landing={landing}
    >
      <Stack
        direction="row"
        sx={{
          gap: 2,
          minWidth: 0,
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <Stack sx={{ gap: 0.5, minWidth: 0, flexGrow: 1 }}>
          <KkHeading level={4} component="h3" sx={{ minWidth: 0 }}>
            {name}
          </KkHeading>
          <KkMeta>{addressText}</KkMeta>
          {hintLine}
          {noteLine}
        </Stack>
        <Stack direction="row" sx={{ gap: 1, flexShrink: 0, alignItems: 'center' }}>
          {actions}
        </Stack>
      </Stack>
    </KkPanel>
  );
};
