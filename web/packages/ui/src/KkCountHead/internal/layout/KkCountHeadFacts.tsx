import Box from '@mui/material/Box';
import type { CSSObject } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';

const arrive = keyframes`
  from { opacity: 0; transform: translateY(0.25rem); }
  to { opacity: 1; transform: none; }
`;

const META: CSSObject = {
  display: 'block',
  minWidth: 0,
  m: 0,
  p: 0,
  listStyle: 'none',
  typography: 'caption',
  lineHeight: 1.4,
  animation: `${arrive} 420ms 900ms cubic-bezier(0.22, 0.61, 0.36, 1) both`,
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
  '& > li': { marginInlineEnd: 1.25, verticalAlign: 'middle' },
  '& > li:last-of-type': { marginInlineEnd: 0 },
};

export const KkCountHeadFacts: FC<PropsWithChildren> = ({ children }) => (
  <Box component="ul" data-kk-count-head-facts sx={META}>
    {children}
  </Box>
);
