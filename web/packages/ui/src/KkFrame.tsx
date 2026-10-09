import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from './internal/focus-ring';
import { KkGreaseMark } from './KkGreaseMark';
import { KkIcon } from './KkIcon';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export type KkFrameState = 'ready' | 'queued' | 'uploading' | 'processing' | 'failed';

export type KkFrameMark =
  | { kind: 'selection'; order: number }
  | { kind: 'reject' }
  | { kind: 'none' };

const { gallery, overlay } = kkTokens;

const breathe = keyframes`
  0%, 100% { opacity: 0; }
  50% { opacity: 0.55; }
`;

const glowFade = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const photoOpacity: Record<KkFrameState, number> = {
  ready: 1,
  queued: 0.28,
  uploading: 0.62,
  processing: 0.86,
  failed: 0.34,
};

const surfaceOf =
  (fill: boolean) =>
  (theme: Theme): CSSObject => ({
    position: 'relative',
    display: 'block',
    width: '100%',
    ...(fill ? { flex: 1, minHeight: 0 } : { aspectRatio: '1 / 1' }),
    overflow: 'hidden',
    backgroundColor: gallery.latent,
    ...focusRing(theme),
  });

const edgeBand: CSSObject = {
  height: gallery.edgeHeight,
  alignItems: 'center',
  px: 0.5,
  backgroundColor: gallery.darkroomEdge,
  backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.16) ${gallery.edgeSprocket / 2}px, transparent ${gallery.edgeSprocket / 2 + 0.5}px)`,
  backgroundSize: `${gallery.edgeSprocketGap}px ${gallery.edgeHeight}px`,
  backgroundPosition: 'right center',
  backgroundRepeat: 'repeat-x',
};

interface KkFrameProps {
  label: string;
  source?: string;
  latentLabel?: string;
  number?: string;
  mark?: KkFrameMark;
  duration?: string;
  state?: KkFrameState;
  progress?: number;
  selected?: boolean;
  glow?: boolean;
  focal?: string;
  fill?: boolean;
  frameId?: string;
  onSelect?: () => void;
  sx?: KkSx;
}

export const KkFrame: FC<KkFrameProps> = ({
  label,
  source,
  latentLabel,
  number,
  mark = { kind: 'none' },
  duration,
  state = 'ready',
  progress = 1,
  selected = false,
  glow = false,
  focal = 'center',
  fill = false,
  frameId,
  onSelect,
  sx,
}) => {
  const interactive = onSelect !== undefined;
  const surfaceComponent = interactive ? ButtonBase : 'div';
  const surfaceRole = interactive ? undefined : 'img';
  const showsProgress = state === 'uploading' || state === 'queued';
  const progressScale = state === 'queued' ? 0 : progress;
  const latent = source === undefined;

  return (
    <Stack
      data-kk-frame
      data-kk-frame-id={frameId}
      data-kk-frame-state={state}
      sx={[{ minWidth: 0, minHeight: 0, position: 'relative' }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Box
        component={surfaceComponent}
        onClick={onSelect}
        aria-label={label}
        role={surfaceRole}
        sx={surfaceOf(fill)}
      >
        {latent ? (
          <Stack
            sx={{
              position: 'absolute',
              inset: 0,
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            <Typography
              component="span"
              sx={(theme) => ({
                ...theme.typography.overline,
                fontFamily: kkTokens.font.display,
                letterSpacing: kkTokens.type.tracking.display,
                lineHeight: 1,
              })}
            >
              {latentLabel}
            </Typography>
          </Stack>
        ) : (
          <Box
            component="img"
            src={source}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: focal,
              display: 'block',
              opacity: photoOpacity[state],
              transition: 'opacity 320ms ease-out',
            }}
          />
        )}
        {state === 'processing' ? (
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundColor: gallery.darkroomEdge,
              animation: `${breathe} 2.4s ease-in-out infinite`,
              '@media (prefers-reduced-motion: reduce)': { animation: 'none', opacity: 0.3 },
            }}
          />
        ) : null}
        {showsProgress ? (
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: kkTokens.line.page,
              bgcolor: 'primary.main',
              transformOrigin: 'left center',
              transform: `scaleX(${progressScale})`,
              transition: 'transform 240ms linear',
            }}
          />
        ) : null}
        {duration === undefined ? null : (
          <Stack
            direction="row"
            sx={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              alignItems: 'center',
              columnGap: 0.25,
              pl: 0.25,
              pr: 0.75,
              py: 0.25,
              color: 'warning.main',
              backgroundColor: 'rgba(5,6,8,0.72)',
              borderTopRightRadius: `${kkTokens.radius.bar * 2}px`,
            }}
          >
            <KkIcon name="play" size="small" />
            <Typography
              component="span"
              sx={(theme) => ({
                ...theme.typography.overline,
                fontFamily: kkTokens.font.display,
                letterSpacing: kkTokens.type.tracking.display,
                lineHeight: 1,
              })}
            >
              {duration}
            </Typography>
          </Stack>
        )}
        {mark.kind === 'selection' ? (
          <Box
            sx={{
              position: 'absolute',
              top: 3,
              right: 3,
              width: '34%',
              maxWidth: 44,
              aspectRatio: '1 / 1',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: '12%',
                borderRadius: '50%',
                backgroundColor: 'rgba(5,6,8,0.55)',
              }}
            />
            <KkGreaseMark kind="circle" sx={{ position: 'absolute', inset: 0 }} />
            <Typography
              component="span"
              sx={(theme) => ({
                ...theme.typography.overline,
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                fontFamily: kkTokens.font.display,
                lineHeight: 1,
                color: 'warning.main',
              })}
            >
              {mark.order}
            </Typography>
          </Box>
        ) : null}
        {mark.kind === 'reject' || state === 'failed' ? (
          <KkGreaseMark kind="cross" sx={{ position: 'absolute', inset: '14%' }} />
        ) : null}
        {selected ? (
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              inset: 0,
              boxShadow: (theme) =>
                `inset 0 0 0 ${kkTokens.line.page}px ${(theme.vars ?? theme).palette.primary.main}`,
              display: 'grid',
              placeItems: 'start',
              p: 0.5,
              color: overlay.onPhotoText,
            }}
          >
            <Box
              sx={{
                display: 'grid',
                placeItems: 'center',
                borderRadius: '50%',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              <KkIcon name="check" size="small" />
            </Box>
          </Box>
        ) : null}
        {glow ? (
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              inset: 0,
              boxShadow: (theme) =>
                `inset 0 0 0 ${kkTokens.line.page}px ${(theme.vars ?? theme).palette.warning.main}`,
              animation: `${glowFade} ${gallery.loupe.glowSeconds}s ease-out forwards`,
            }}
          />
        ) : null}
      </Box>
      {number === undefined ? null : (
        <Stack direction="row" aria-hidden sx={edgeBand}>
          <Typography
            component="span"
            sx={(theme) => ({
              ...theme.typography.overline,
              fontFamily: kkTokens.font.display,
              letterSpacing: kkTokens.type.tracking.label,
              lineHeight: 1,
              color: 'warning.main',
              opacity: 0.85,
              pr: 0.5,
              backgroundColor: gallery.darkroomEdge,
            })}
          >
            {number}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};
