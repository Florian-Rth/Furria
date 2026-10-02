import { useTheme } from '@mui/material/styles';
import { usePublicBoardQuery } from '@/features/club/api';
import type { BoardTile } from '@/features/club/people-content';
import { toBoardTiles } from '@/features/club/people-content';

export const useBoardTiles = (): BoardTile[] => {
  const theme = useTheme();
  const { data } = usePublicBoardQuery();

  return toBoardTiles(data ?? [], theme);
};
