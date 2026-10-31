import useMediaQuery from '@mui/material/useMediaQuery';

export const KK_LANE_DESK_MIN_WIDTH = 840;

export const useKkLaneWide = (): boolean =>
  useMediaQuery(`(min-width: ${KK_LANE_DESK_MIN_WIDTH}px)`, { noSsr: true });
