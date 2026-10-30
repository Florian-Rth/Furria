import useMediaQuery from '@mui/material/useMediaQuery';

export const KK_FOCUS_DESK_QUERY = '(min-width: 52.5rem)';

export const useKkFocusDesk = (): boolean => useMediaQuery(KK_FOCUS_DESK_QUERY, { noSsr: true });
