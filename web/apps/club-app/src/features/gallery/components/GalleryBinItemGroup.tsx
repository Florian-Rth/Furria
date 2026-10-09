import type { KkFrameMark } from '@furria/ui';
import { KkFilmEdge, KkFrame, KkFrameGrid } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { BinGroup } from '../bin-countdown';
import { countdownEdge, countdownLabel, purgeCountdownOf } from '../bin-countdown';
import { countLabel, thumbSourceOf } from '../gallery-view';
import type { BinnedItem } from '../schemas';

const REJECT_MARK: KkFrameMark = { kind: 'reject' };

interface GalleryBinItemGroupProps {
  group: BinGroup<BinnedItem>;
  now: Date;
  picked: ReadonlySet<number>;
  onToggle: (mediaItemId: number) => void;
}

export const GalleryBinItemGroup: FC<GalleryBinItemGroupProps> = ({
  group,
  now,
  picked,
  onToggle,
}) => {
  const firstCountdown = purgeCountdownOf(group.firstPurgesAt, now);
  const meta = `${countLabel(group.entries.length)} gelöscht`;
  const trail = countdownLabel(firstCountdown);
  const trailTone = firstCountdown.urgency === 'urgent' ? 'red' : 'muted';
  const frames = group.entries.map((entry) => {
    const toggle = (): void => onToggle(entry.item.mediaItemId);
    const countdown = purgeCountdownOf(entry.purgesAt, now);
    const label = `${entry.originalFileName}, ${countdownLabel(countdown)}`;
    const source = thumbSourceOf(entry.item.urls);
    const edge = countdownEdge(countdown);
    const isPicked = picked.has(entry.item.mediaItemId);
    return (
      <KkFrame
        key={entry.item.mediaItemId}
        label={label}
        source={source}
        number={edge}
        mark={REJECT_MARK}
        selected={isPicked}
        onSelect={toggle}
      />
    );
  });

  return (
    <Stack component="section" aria-label={group.albumTitle} sx={{ rowGap: 0.75, minWidth: 0 }}>
      <Stack direction="row" sx={{ alignItems: 'baseline', columnGap: 1, minWidth: 0 }}>
        <KkFilmEdge lead={group.albumTitle} meta={meta} level="h3" sprockets sx={{ flex: 1 }} />
        <KkFilmEdge lead={trail} tone={trailTone} />
      </Stack>
      <KkFrameGrid label={group.albumTitle}>{frames}</KkFrameGrid>
    </Stack>
  );
};
