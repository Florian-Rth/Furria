import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { KkStageArea } from '../../../KkStageArea';
import { kkTokens } from '../../../tokens';

export type KkStudioDStageSize = 'full' | 'inset';

const PERCENT = 100;

interface KkStudioDStageRootProps extends PropsWithChildren {
  label: string;
  widthMetres: number;
  depthMetres: number;
  artworkSvg: string | null;
  size: KkStudioDStageSize;
}

export const KkStudioDStageRoot: FC<KkStudioDStageRootProps> = ({
  label,
  widthMetres,
  depthMetres,
  artworkSvg,
  size,
  children,
}) => {
  const fitted = size === 'full';
  const width = fitted
    ? `min(${PERCENT}cqw, calc(${PERCENT}cqh * ${widthMetres / depthMetres}))`
    : '100%';

  return (
    <Box data-kk-studio-d-stage={size} sx={{ width, flexShrink: 0 }}>
      <KkStageArea
        label={label}
        widthMetres={widthMetres}
        depthMetres={depthMetres}
        artworkSvg={artworkSvg}
        sx={{
          borderRadius: fitted ? `${kkTokens.radius.base}px` : 0,
          borderWidth: fitted ? kkTokens.line.hair : 0,
          borderBottomWidth: fitted ? kkTokens.line.page : kkTokens.line.section,
          overflow: 'clip',
          boxShadow: fitted ? kkTokens.shadow.raised : 'none',
        }}
      >
        <Box
          data-kk-studio-d-stage-field
          sx={{ position: 'absolute', inset: 0, containerType: 'size', pointerEvents: 'none' }}
        >
          {children}
        </Box>
      </KkStageArea>
    </Box>
  );
};
