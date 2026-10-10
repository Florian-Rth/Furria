import useMediaQuery from '@mui/material/useMediaQuery';

export const useIsWideScreen = (): boolean =>
  useMediaQuery((theme) => theme.breakpoints.up('lg'), { noSsr: true });
