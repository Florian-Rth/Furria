import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkImageSource } from './image-source';
import type { KkClubIcon } from './internal/club-icon';
import type { KkGroupTone } from './internal/group-tone';
import {
  GROUP_TONE_ON_FIELD_DARK,
  GROUP_TONE_ON_FIELD_LIGHT,
  groupToneFieldScheme,
} from './internal/group-tone';
import { inkWashSurface } from './internal/ink-wash';
import { applyScheme, schemeInk } from './internal/scheme-paint';
import { KkClubIconGlyph } from './KkClubIconGlyph';
import type { KkIconName } from './KkIcon';
import { KkIcon } from './KkIcon';
import { KkPhoto } from './KkPhoto';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const MARK_SIZE = '2.25rem';
const GLYPH_SIZE = '1.125rem';
const MARK_RADIUS = kkTokens.radius.bar * 3;
const ON_FIELD = schemeInk(GROUP_TONE_ON_FIELD_LIGHT, GROUP_TONE_ON_FIELD_DARK);

interface KkPictureMarkProps {
  image: KkImageSource | null;
  tone: KkGroupTone | null;
  clubIcon: KkClubIcon | null;
  icon?: KkIconName;
  alt: string;
  sx?: KkSx;
}

export const KkPictureMark: FC<KkPictureMarkProps> = ({ image, tone, clubIcon, icon, alt, sx }) => {
  const glyph =
    clubIcon !== null ? (
      <KkClubIconGlyph icon={clubIcon} sx={{ width: GLYPH_SIZE, height: GLYPH_SIZE }} />
    ) : (
      <KkIcon name={icon ?? 'stage'} sx={{ width: GLYPH_SIZE, height: GLYPH_SIZE }} />
    );
  const content =
    image === null ? (
      glyph
    ) : (
      <KkPhoto
        alt={alt}
        image={image}
        tone={tone ?? undefined}
        fill
        sx={{ width: '100%', height: '100%' }}
      />
    );

  return (
    <Box
      component="span"
      data-kk-picture-mark
      sx={[
        (theme) => ({
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          width: MARK_SIZE,
          height: MARK_SIZE,
          borderRadius: `${MARK_RADIUS}px`,
          overflow: 'clip',
          ...(tone === null
            ? { ...inkWashSurface(theme, '7%', '12%'), color: 'text.secondary' }
            : applyScheme(theme, groupToneFieldScheme(tone), ON_FIELD)),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {content}
    </Box>
  );
};
