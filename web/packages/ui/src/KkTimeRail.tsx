import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { useRef } from 'react';
import { KkFlapCount } from './KkFlapCount';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';
import { useLetterRailScrub } from './use-letter-rail-scrub';

const { gallery } = kkTokens;

export interface KkTimeRailScene {
  id: string;
  hour: string | null;
  time: string;
  caption: string;
  source?: string;
}

interface KkTimeRailProps {
  label: string;
  scenes: readonly KkTimeRailScene[];
  current: number;
  onReach: (index: number) => void;
  sx?: KkSx;
}

export const KkTimeRail: FC<KkTimeRailProps> = ({ label, scenes, current, onReach, sx }) => {
  const railRef = useRef<HTMLDivElement | null>(null);
  const scrub = useLetterRailScrub(railRef, onReach, true);
  const shown = scrub.held === null ? null : scenes[scrub.held];
  const ticks = scenes.map((scene, index) => (
    <Box
      key={scene.id}
      data-kk-letter-index-cell
      aria-hidden
      sx={{
        flex: 1,
        minHeight: 0,
        position: 'relative',
        display: 'grid',
        placeItems: 'center end',
      }}
    >
      {scene.hour === null ? (
        <Box
          sx={{
            width: index === current ? 12 : 6,
            height: kkTokens.line.hair,
            bgcolor: index === current ? 'primary.main' : 'text.disabled',
            transition: 'width 160ms ease-out',
          }}
        />
      ) : (
        <Typography
          component="span"
          sx={(theme) => ({
            ...theme.typography.overline,
            fontFamily: kkTokens.font.display,
            lineHeight: 1,
            color: index === current ? 'primary.main' : 'text.secondary',
          })}
        >
          {scene.hour}
        </Typography>
      )}
    </Box>
  ));

  return (
    <Box
      data-kk-time-rail
      sx={[
        {
          position: 'fixed',
          right: 0,
          top: '22dvh',
          bottom: '18dvh',
          width: gallery.rail.width,
          zIndex: 2,
          touchAction: 'none',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Stack
        ref={railRef}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={1}
        aria-valuemax={scenes.length}
        aria-valuenow={current + 1}
        aria-valuetext={scenes[current]?.caption}
        onPointerDown={scrub.onPointerDown}
        onPointerMove={scrub.onPointerMove}
        onPointerUp={scrub.onPointerUp}
        onPointerCancel={scrub.onPointerUp}
        sx={{ height: '100%', pr: 0.75, py: 0.5, cursor: 'ns-resize' }}
      >
        {ticks}
      </Stack>
      {shown === undefined || shown === null ? null : (
        <Stack
          aria-hidden
          sx={{
            position: 'absolute',
            right: gallery.rail.width + 6,
            top: `calc(${((scrub.held ?? 0) / Math.max(scenes.length - 1, 1)) * 100}% - ${gallery.rail.previewWidth / 2}px)`,
            width: gallery.rail.previewWidth,
            bgcolor: gallery.darkroom,
            color: kkTokens.overlay.onPhotoText,
            borderRadius: `${kkTokens.radius.base}px`,
            boxShadow: kkTokens.shadow.floating,
            p: 0.5,
            rowGap: 0.5,
          }}
        >
          <Box
            component="img"
            src={shown.source}
            alt=""
            sx={{
              display: 'block',
              width: '100%',
              aspectRatio: '1 / 1',
              objectFit: 'cover',
              borderRadius: `${kkTokens.radius.base - 4}px`,
            }}
          />
          <Stack direction="row" sx={{ alignItems: 'baseline', columnGap: 0.75, px: 0.5 }}>
            <KkFlapCount value={shown.time} variant="h3" tone="gold" />
            <Typography
              component="span"
              sx={(theme) => ({
                ...theme.typography.caption,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.7)',
                whiteSpace: 'nowrap',
              })}
            >
              {shown.caption}
            </Typography>
          </Stack>
        </Stack>
      )}
    </Box>
  );
};
