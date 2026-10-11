import { useTheme } from '@mui/material/styles';
import { publicBoard } from '@/features/club/api';
import type { BoardTile } from '@/features/club/people-content';
import { toBoardTiles } from '@/features/club/people-content';
import { readySourceData } from '@/lib/public-resource/public-source';

export const useBoardTiles = (): BoardTile[] => {
  const theme = useTheme();
  const seats = readySourceData(publicBoard.useSource()) ?? [];

  return toBoardTiles(seats, theme);
};
