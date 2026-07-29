import { kkTokens } from '@furria/ui';
import ButtonBase from '@mui/material/ButtonBase';
import type { FC, PropsWithChildren } from 'react';
import type { Photo } from '@/features/gallery/gallery-content';
import { buildPhotoOpenLabel } from '@/features/gallery/gallery-content';

interface PhotoTileActionProps extends PropsWithChildren {
  photo: Photo;
  onOpen: () => void;
}

export const PhotoTileAction: FC<PhotoTileActionProps> = ({ photo, onOpen, children }) => {
  const openLabel = buildPhotoOpenLabel(photo);

  return (
    <ButtonBase
      data-kk-photo-tile-action
      aria-label={openLabel}
      onClick={onOpen}
      focusRipple
      sx={{
        display: 'block',
        width: '100%',
        height: '100%',
        borderRadius: `${kkTokens.radius.base}px`,
        transition: 'transform 160ms ease-out',
        '@media (hover: hover)': {
          '&:hover': { transform: 'scale(1.015)' },
        },
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
          '&:hover': { transform: 'none' },
        },
        '&:focus-visible': {
          outlineWidth: 2,
          outlineStyle: 'solid',
          outlineColor: 'primary.main',
          outlineOffset: 3,
        },
      }}
    >
      {children}
    </ButtonBase>
  );
};
