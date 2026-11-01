import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkStateGlyph } from '@furria/ui/KkStateGlyph';
import { KkWorkQueue } from '@furria/ui/KkWorkQueue';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { UploadLinkRowView } from '../hooks/use-upload-links-page';
import { OPEN_ROW_LABEL, SHARE_LABEL } from '../upload-link-copy';

interface UploadLinkQueueProps {
  label: string;
  rows: readonly UploadLinkRowView[];
  onOpen: (uploadLinkId: number) => void;
  onShare: (uploadLinkId: number) => void;
}

export const UploadLinkQueue: FC<UploadLinkQueueProps> = ({ label, rows, onOpen, onShare }) => {
  const items = rows.map((row) => {
    const open = (): void => onOpen(row.uploadLinkId);
    const share = (): void => onShare(row.uploadLinkId);
    const action = row.shareable ? (
      <KkWorkQueue.Action icon="share" label={SHARE_LABEL} onSelect={share} />
    ) : undefined;
    const whenTone = row.urgent ? 'attention' : 'ink';
    return (
      <KkWorkQueue.Row
        key={row.uploadLinkId}
        mark={<KkStateGlyph state={row.mark} />}
        title={row.title}
        fact={row.fact}
        day={row.day}
        relative={row.relative}
        whenTone={whenTone}
        action={action}
        openLabel={OPEN_ROW_LABEL}
        highlight={row.highlight}
        onOpen={open}
      />
    );
  });

  return (
    <Stack component="section" sx={{ rowGap: 0.75, minWidth: 0 }}>
      <KkEyebrow tone="muted">{label}</KkEyebrow>
      <KkWorkQueue label={label}>{items}</KkWorkQueue>
    </Stack>
  );
};
