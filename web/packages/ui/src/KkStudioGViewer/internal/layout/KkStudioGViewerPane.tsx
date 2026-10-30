import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { STUDIO_G_WIDE } from '../../../KkStudioGDesk/internal/logic/studio-g-desk-queries';
import { kkTokens } from '../../../tokens';

export type KkStudioGViewerPaneRole = 'video' | 'stage';
export type KkStudioGViewerPanePlacement = 'main' | 'inset';

const SWAP = 'opacity 260ms ease-out';
const WIDE_AREA: Record<KkStudioGViewerPaneRole, string> = { video: 'left', stage: 'right' };

interface KkStudioGViewerPaneProps extends PropsWithChildren {
  content: KkStudioGViewerPaneRole;
  placement: KkStudioGViewerPanePlacement;
  label: string;
}

export const KkStudioGViewerPane: FC<KkStudioGViewerPaneProps> = ({
  content,
  placement,
  label,
  children,
}) => {
  const inset = placement === 'inset';

  return (
    <Box
      role="region"
      aria-label={label}
      data-kk-studio-g-pane={content}
      data-placement={placement}
      sx={(theme) => ({
        gridArea: placement,
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
        minWidth: 0,
        minHeight: 0,
        containerType: 'size',
        aspectRatio: inset ? '16 / 9' : 'auto',
        alignSelf: inset ? 'end' : 'stretch',
        borderRadius: `${kkTokens.radius.base}px`,
        backgroundColor: inset ? (theme.vars ?? theme).palette.background.paper : 'transparent',
        boxShadow: inset
          ? `inset 0 0 0 ${kkTokens.line.hair}px ${(theme.vars ?? theme).palette.divider}, ${kkTokens.shadow.rest}`
          : 'none',
        overflow: inset ? 'clip' : 'visible',
        transition: SWAP,
        '& [data-kk-studio-g-front]': { display: inset ? 'none' : 'block' },
        [STUDIO_G_WIDE]: {
          gridArea: WIDE_AREA[content],
          aspectRatio: 'auto',
          alignSelf: 'stretch',
          backgroundColor: 'transparent',
          boxShadow: 'none',
          overflow: 'visible',
          '& [data-kk-studio-g-front]': { display: 'block' },
          '& [data-kk-studio-g-swap]': { display: 'none' },
        },
      })}
    >
      {children}
    </Box>
  );
};
