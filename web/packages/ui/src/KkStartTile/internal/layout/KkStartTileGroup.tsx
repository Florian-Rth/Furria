import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import { TILE_AUTHOR_FACE, TILE_AUTHOR_GAP } from '../tile-paint';

const GROUP_FRAME: CSSObject = { gap: 0.5, minWidth: 0 };

const linesFrame = (theme: Theme): CSSObject => ({
  gap: 0.75,
  minWidth: 0,
  pl: `calc(${TILE_AUTHOR_FACE} + ${theme.spacing(TILE_AUTHOR_GAP)})`,
});

interface KkStartTileGroupProps extends PropsWithChildren {
  head: ReactNode;
}

export const KkStartTileGroup: FC<KkStartTileGroupProps> = ({ head, children }) => (
  <Stack data-kk-start-tile-group sx={GROUP_FRAME}>
    {head}
    <Stack sx={linesFrame}>{children}</Stack>
  </Stack>
);
