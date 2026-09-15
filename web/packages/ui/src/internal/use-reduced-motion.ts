import useMediaQuery from '@mui/material/useMediaQuery';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export const useReducedMotion = (): boolean => useMediaQuery(REDUCED_MOTION_QUERY);
