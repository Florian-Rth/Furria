import useMediaQuery from '@mui/material/useMediaQuery';

export const KK_SCORE_WIDE_QUERY = '(min-width: 45em)';

export const useKkScoreWide = (): boolean => useMediaQuery(KK_SCORE_WIDE_QUERY, { noSsr: true });
