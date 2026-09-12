import useMediaQuery from '@mui/material/useMediaQuery';

export const useIsMobile = (): boolean =>
  useMediaQuery((theme) => theme.breakpoints.down('desktop'), { noSsr: true });
