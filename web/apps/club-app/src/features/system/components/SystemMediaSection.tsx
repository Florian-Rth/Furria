import { KkFlapGrid } from '@furria/ui/KkFlapGrid';
import { KkHeartbeat } from '@furria/ui/KkHeartbeat';
import { KkReadout } from '@furria/ui/KkReadout';
import { KkSlotStrip } from '@furria/ui/KkSlotStrip';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { SystemStatus } from '../schemas';
import {
  FAILED_TITLE,
  MEDIA_GRID_LABEL,
  QUEUE_LABEL,
  SECTION_TITLES,
  WORKERS_EMPTY,
} from '../system-copy';
import { mediaViewOf } from '../system-view';

interface SystemMediaSectionProps {
  status: SystemStatus;
  nowMs: number;
  dimmed: boolean;
}

export const SystemMediaSection: FC<SystemMediaSectionProps> = ({ status, nowMs, dimmed }) => {
  const media = mediaViewOf(status, nowMs);
  const heartbeats = media.workers.map((worker) => (
    <KkHeartbeat
      key={worker.key}
      state={worker.state}
      beatKey={worker.beatKey}
      title={worker.title}
      word={worker.word}
      meta={worker.meta}
    />
  ));
  const workers =
    heartbeats.length === 0 ? <KkReadout.Note text={WORKERS_EMPTY} level="broken" /> : heartbeats;
  const failedLines = media.failed.map((item) => (
    <KkReadout.Line
      key={item.key}
      title={item.title}
      meta={item.meta}
      reason={item.reason}
      trailing={item.trailing}
      level="broken"
    />
  ));
  const failed =
    failedLines.length === 0 ? null : (
      <Stack sx={{ minWidth: 0 }}>
        <KkReadout.Note text={FAILED_TITLE} />
        <KkReadout.Lines>{failedLines}</KkReadout.Lines>
      </Stack>
    );

  return (
    <KkReadout label={SECTION_TITLES.media} aside={media.totalBytes} dimmed={dimmed}>
      <KkSlotStrip
        label={QUEUE_LABEL}
        running={media.queue.running}
        retrying={media.queue.retrying}
        queued={media.queue.queued}
        aside={media.queue.aside}
      />
      <Stack sx={{ minWidth: 0 }}>{workers}</Stack>
      <KkFlapGrid label={MEDIA_GRID_LABEL} columns={media.columns} rows={media.rows} />
      {failed}
    </KkReadout>
  );
};
