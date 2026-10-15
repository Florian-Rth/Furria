import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkImageSource } from '../../../image-source';
import type { KkClubIcon } from '../../../internal/club-icon';
import type { KkGroupTone } from '../../../internal/group-tone';
import { groupToneEdgeScheme, groupToneFieldPaint } from '../../../internal/group-tone';
import type { KkScheme } from '../../../internal/scheme-paint';
import { applyScheme } from '../../../internal/scheme-paint';
import { KkClubIconGlyph } from '../../../KkClubIconGlyph';
import { KkPhoto } from '../../../KkPhoto';
import { kkTokens } from '../../../tokens';

const STRIP_WIDTH = { xs: 13, desktop: 16 };
const CREST_SIZE = '170%';
const CREST_BLEED_RIGHT = '-62%';
const CREST_BLEED_BOTTOM = '-34%';
const CREST_REST = 'rotate(-12deg)';
const CREST_LIFT = 'translate(-4px, -4px) rotate(-6deg)';
const BADGE_SIZE = 4;
const BADGE_INSET = 1;
const BADGE_PAD = 0.75;
const CARD_HOVER = '.MuiCardActionArea-root:hover &';

const crestOpacityScheme: KkScheme = {
  light: { opacity: kkTokens.opacity.groupCrest },
  dark: { opacity: kkTokens.opacity.groupCrestDark },
};

interface KkGroupCardCrestProps {
  tone: KkGroupTone;
  icon: KkClubIcon;
  image: KkImageSource | null;
}

export const KkGroupCardCrest: FC<KkGroupCardCrestProps> = ({ tone, icon, image }) => {
  const face =
    image === null ? (
      <Box
        aria-hidden
        data-kk-group-card-crest-glyph
        sx={(theme) => ({
          position: 'absolute',
          right: CREST_BLEED_RIGHT,
          bottom: CREST_BLEED_BOTTOM,
          width: CREST_SIZE,
          aspectRatio: '1',
          pointerEvents: 'none',
          transform: CREST_REST,
          transition: kkTokens.motion.bar,
          ...applyScheme(theme, crestOpacityScheme),
          '@media (hover: hover) and (prefers-reduced-motion: no-preference)': {
            [CARD_HOVER]: { transform: CREST_LIFT },
          },
        })}
      >
        <KkClubIconGlyph icon={icon} />
      </Box>
    ) : (
      <>
        <KkPhoto alt="" image={image} tone={tone} fill sx={{ position: 'absolute', inset: 0 }} />
        <Box
          aria-hidden
          data-kk-group-card-crest-badge
          sx={(theme) => ({
            position: 'absolute',
            left: theme.spacing(BADGE_INSET),
            bottom: theme.spacing(BADGE_INSET),
            width: theme.spacing(BADGE_SIZE),
            height: theme.spacing(BADGE_SIZE),
            p: BADGE_PAD,
            borderRadius: '50%',
            boxShadow: `0 0 0 ${kkTokens.line.section}px ${kkTokens.overlay.onPhotoText}`,
            ...groupToneFieldPaint(theme, tone),
          })}
        >
          <KkClubIconGlyph icon={icon} />
        </Box>
      </>
    );

  return (
    <Box
      data-kk-group-card-crest
      sx={(theme) => ({
        position: 'relative',
        flexShrink: 0,
        alignSelf: 'stretch',
        width: { xs: theme.spacing(STRIP_WIDTH.xs), desktop: theme.spacing(STRIP_WIDTH.desktop) },
        overflow: 'hidden',
        borderRightWidth: kkTokens.line.page,
        borderRightStyle: 'solid',
        ...groupToneFieldPaint(theme, tone),
        ...applyScheme(theme, groupToneEdgeScheme(tone)),
      })}
    >
      {face}
    </Box>
  );
};
