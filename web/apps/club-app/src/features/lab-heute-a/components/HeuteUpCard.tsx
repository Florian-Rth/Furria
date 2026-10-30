import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkHeading } from '@furria/ui/KkHeading';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkPanel } from '@furria/ui/KkPanel';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { LiveLine } from '@/features/live/schemas';
import { toLineMeta } from '../heute-a-copy';

interface HeuteUpCardProps {
  label: string;
  line: LiveLine | null;
  emptyText: string;
}

export const HeuteUpCard: FC<HeuteUpCardProps> = ({ label, line, emptyText }) => {
  const name = line?.name ?? emptyText;
  const empty = line === null;
  const metaText = line === null ? null : toLineMeta(line.group?.name ?? null, line.cast.length);
  const meta = metaText === null ? null : <KkMeta lines={1}>{metaText}</KkMeta>;

  return (
    <KkPanel variant="block" tone="raised" dimmed={empty} sx={{ height: '100%' }}>
      <Stack sx={{ gap: 0.25, minWidth: 0 }}>
        <KkEyebrow tone="muted">{label}</KkEyebrow>
        <KkHeading level={3} component="h2">
          {name}
        </KkHeading>
        {meta}
      </Stack>
    </KkPanel>
  );
};
