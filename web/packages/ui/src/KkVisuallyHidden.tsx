import Box from '@mui/material/Box';
import type { CSSObject } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';

const SINGLE_PIXEL = '1px';
const PULLED_BACK_PIXEL = `-${SINGLE_PIXEL}`;

export const HIDDEN_FROM_SIGHT: CSSObject = {
  position: 'absolute',
  width: SINGLE_PIXEL,
  height: SINGLE_PIXEL,
  padding: 0,
  margin: PULLED_BACK_PIXEL,
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  border: 0,
};

export type KkVisuallyHiddenElement = 'span' | 'h1';

interface KkVisuallyHiddenProps extends PropsWithChildren {
  component?: KkVisuallyHiddenElement;
}

export const KkVisuallyHidden: FC<KkVisuallyHiddenProps> = ({ component = 'span', children }) => (
  <Box component={component} data-kk-visually-hidden sx={HIDDEN_FROM_SIGHT}>
    {children}
  </Box>
);
