const MS_PER_DAY = 86_400_000;
const URGENT_DAYS = 3;

export type PurgeUrgency = 'calm' | 'urgent';

export interface PurgeCountdown {
  daysLeft: number;
  urgency: PurgeUrgency;
}

export const purgeCountdownOf = (purgesAt: string, now: Date): PurgeCountdown => {
  const daysLeft = Math.max(Math.ceil((Date.parse(purgesAt) - now.getTime()) / MS_PER_DAY), 0);
  return { daysLeft, urgency: daysLeft <= URGENT_DAYS ? 'urgent' : 'calm' };
};

interface BinnedEntry {
  albumId: number;
  albumTitle: string;
  purgesAt: string;
}

export interface BinGroup<TEntry extends BinnedEntry> {
  albumId: number;
  albumTitle: string;
  firstPurgesAt: string;
  entries: TEntry[];
}

export const binGroupsOf = <TEntry extends BinnedEntry>(
  entries: readonly TEntry[],
): BinGroup<TEntry>[] => {
  const groups = new Map<number, BinGroup<TEntry>>();
  for (const entry of entries) {
    const group = groups.get(entry.albumId);
    if (group === undefined) {
      groups.set(entry.albumId, {
        albumId: entry.albumId,
        albumTitle: entry.albumTitle,
        firstPurgesAt: entry.purgesAt,
        entries: [entry],
      });
    } else {
      group.entries.push(entry);
      if (Date.parse(entry.purgesAt) < Date.parse(group.firstPurgesAt)) {
        group.firstPurgesAt = entry.purgesAt;
      }
    }
  }
  return [...groups.values()].sort(
    (left, right) => Date.parse(left.firstPurgesAt) - Date.parse(right.firstPurgesAt),
  );
};

export const countdownLabel = ({ daysLeft }: PurgeCountdown): string => {
  if (daysLeft === 0) {
    return 'wird heute gelöscht';
  }
  return daysLeft === 1 ? 'noch 1 Tag' : `noch ${daysLeft} Tage`;
};

export const countdownEdge = ({ daysLeft }: PurgeCountdown): string => `${daysLeft} T`;
