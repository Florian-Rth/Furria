import Avatar from '@mui/material/Avatar';
import type { ElementType, FC } from 'react';
import type { KkImageSource } from '../../../image-source';
import type { KkGroupTone } from '../../../internal/group-tone';
import { groupToneFieldPaint } from '../../../internal/group-tone';
import { applyScheme, schemeFill } from '../../../internal/scheme-paint';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import type { KkAvatarTypography } from '../avatar-tier';

interface KkAvatarFaceProps {
  initials: string;
  image?: KkImageSource | null;
  extent: string;
  imageSizes: string;
  typography: KkAvatarTypography;
  tone?: KkGroupTone;
  component?: ElementType;
  sx?: KkSx;
}

export const KkAvatarFace: FC<KkAvatarFaceProps> = ({
  initials,
  image,
  extent,
  imageSizes,
  typography,
  tone,
  component,
  sx,
}) => {
  const componentProps = component === undefined ? {} : { component };
  const portraitProps =
    image === undefined || image === null
      ? {}
      : {
          src: image.src,
          srcSet: image.srcSet,
          sizes: image.sizes ?? imageSizes,
          alt: initials,
        };

  const paint: KkSx = (theme) =>
    tone === undefined
      ? {
          ...applyScheme(
            theme,
            schemeFill(kkTokens.color.light.avatar, kkTokens.color.dark.avatar),
          ),
          color: 'text.primary',
          borderColor: 'divider',
        }
      : { ...groupToneFieldPaint(theme, tone), borderColor: 'transparent' };

  return (
    <Avatar
      {...componentProps}
      {...portraitProps}
      data-kk-avatar
      sx={[
        {
          width: extent,
          height: extent,
          borderWidth: kkTokens.line.hair,
          borderStyle: 'solid',
          typography,
          fontFamily: kkTokens.font.display,
          fontWeight: kkTokens.font.displayWeight,
          letterSpacing: kkTokens.type.tracking.display,
        },
        paint,
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {initials}
    </Avatar>
  );
};
