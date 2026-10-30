import { KkEightsSheet } from '@furria/ui/KkEightsSheet';
import type { FC } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { SheetRow } from '../count-sheet';
import { useEightsCursor } from '../hooks/use-eights-cursor';

interface EightsCursorLiveProps {
  player: MixPlayer;
  rows: readonly SheetRow[];
  columns: number;
  playing: boolean;
}

export const EightsCursorLive: FC<EightsCursorLiveProps> = ({ player, rows, columns, playing }) => {
  const seconds = usePlaybackSeconds(player);
  const cursor = useEightsCursor(rows, seconds);

  if (cursor === null) {
    return null;
  }

  return (
    <KkEightsSheet.Cursor
      row={cursor.row}
      column={cursor.column}
      columns={columns}
      following={playing}
    />
  );
};
