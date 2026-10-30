import useMediaQuery from '@mui/material/useMediaQuery';

const WIDE_QUERY = '(min-width: 52.5rem)';

export const useKkEightsWide = (): boolean => useMediaQuery(WIDE_QUERY, { noSsr: true });
