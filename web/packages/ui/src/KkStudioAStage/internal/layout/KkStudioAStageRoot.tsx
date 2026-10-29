import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import { KkStageArea } from '../../../KkStageArea';
import type { KkSx } from '../../../kk-sx';

interface KkStudioAStageRootProps extends PropsWithChildren {
  label: string;
  widthMetres: number;
  depthMetres: number;
  artworkSvg: string | null;
  legend?: ReactNode;
  sx?: KkSx;
}

export const KkStudioAStageRoot: FC<KkStudioAStageRootProps> = ({
  label,
  widthMetres,
  depthMetres,
  artworkSvg,
  legend,
  sx,
  children,
}) => (
  <Stack sx={[{ gap: 0.75, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}>
    <KkStageArea
      label={label}
      widthMetres={widthMetres}
      depthMetres={depthMetres}
      artworkSvg={artworkSvg}
      sx={{ borderRadius: (theme) => theme.spacing(1.5), overflow: 'clip' }}
    >
      <Box
        data-kk-studio-a-stage-field
        sx={{ position: 'absolute', inset: 0, containerType: 'size', pointerEvents: 'none' }}
      >
        {children}
      </Box>
    </KkStageArea>
    <Stack
      direction="row"
      sx={{
        alignItems: 'center',
        columnGap: 2,
        rowGap: 0.5,
        flexWrap: 'wrap',
        minWidth: 0,
        px: 0.5,
      }}
    >
      {legend}
    </Stack>
  </Stack>
);
