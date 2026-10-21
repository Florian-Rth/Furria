import { KkStartTile } from '@furria/ui';
import type { FC } from 'react';
import type { EntryMarkView } from '../hooks/use-calendar-tile';

interface TileMarkProps {
  mark: EntryMarkView | null;
}

export const EntryMark: FC<TileMarkProps> = ({ mark }) => {
  if (mark === null) {
    return null;
  }

  return <KkStartTile.Mark kind={mark.kind} label={mark.label} />;
};
