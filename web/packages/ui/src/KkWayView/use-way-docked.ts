import useMediaQuery from '@mui/material/useMediaQuery';

const WIDE_AND_TALL = '(min-aspect-ratio: 5/4) and (min-height: 40rem)';

export const useWayDocked = (): boolean => useMediaQuery(WIDE_AND_TALL, { noSsr: true });
