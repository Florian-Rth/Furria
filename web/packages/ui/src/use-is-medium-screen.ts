import useMediaQuery from '@mui/material/useMediaQuery';

export const useIsMediumScreen = (): boolean =>
  useMediaQuery((theme) => theme.breakpoints.up('md'), { noSsr: true });
