import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { focusRing } from '../internal/focus-ring';
import { useReducedMotion } from '../internal/use-reduced-motion';
import { KkButton } from '../KkButton';
import { KkFilmEdge } from '../KkFilmEdge';
import { KkFlapCount } from '../KkFlapCount';
import { KkIcon } from '../KkIcon';
import { KkIconButton } from '../KkIconButton';
import { KK_DARK_SCHEME_ATTRIBUTE } from '../theme';
import { kkTokens } from '../tokens';
import { KkLoupeFilm } from './KkLoupeFilm';
import { KkLoupeLatent } from './KkLoupeLatent';
import type { KkLoupeIntents } from './use-loupe-gestures';
import { useLoupeGestures } from './use-loupe-gestures';

const { gallery } = kkTokens;
const darkScheme = { [KK_DARK_SCHEME_ATTRIBUTE]: '' };
const STRIP_FRAME = 52;

const focusOnMount = (node: HTMLDivElement | null): void => {
  node?.focus();
};

export interface KkLoupeStripFrame {
  id: string;
  label: string;
  source?: string;
  current: boolean;
}

export interface KkLoupeLabels {
  dialog: string;
  close: string;
  download: string;
  previousScene: string;
  nextScene: string;
  play: string;
  developing: string;
}

export interface KkLoupeVideo {
  source: string;
  duration: string;
}

interface KkLoupeProps extends KkLoupeIntents {
  source?: string;
  alt: string;
  counter: string;
  time: string;
  scene: string;
  facts: string;
  video?: KkLoupeVideo;
  caption?: string;
  strip: readonly KkLoupeStripFrame[];
  labels: KkLoupeLabels;
  onStripSelect: (id: string) => void;
}

export const KkLoupe: FC<KkLoupeProps> = ({
  source,
  alt,
  counter,
  time,
  scene,
  facts,
  video,
  caption,
  strip,
  labels,
  onStripSelect,
  ...intents
}) => {
  const reducedMotion = useReducedMotion();
  const gestures = useLoupeGestures(intents);
  const opening = reducedMotion
    ? { opacity: 0 }
    : { opacity: 0, clipPath: 'circle(8% at 50% 46%)', scale: 0.96 };
  const opened = reducedMotion
    ? { opacity: 1 }
    : { opacity: 1, clipPath: 'circle(120% at 50% 46%)', scale: 1 };
  const photoShift = { x: gestures.drag.x, y: gestures.drag.y };
  const stripFrames = strip.map((frame) => (
    <ButtonBase
      key={frame.id}
      aria-label={frame.label}
      aria-current={frame.current || undefined}
      onClick={() => onStripSelect(frame.id)}
      sx={(theme: Theme) => ({
        flex: `0 0 ${STRIP_FRAME}px`,
        height: STRIP_FRAME,
        opacity: frame.current ? 1 : 0.55,
        outline: frame.current ? `${kkTokens.line.section}px solid` : 'none',
        outlineColor: (theme.vars ?? theme).palette.warning.main,
        outlineOffset: -kkTokens.line.section,
        ...focusRing(theme),
      })}
    >
      {frame.source === undefined ? null : (
        <Box
          component="img"
          src={frame.source}
          alt=""
          sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      )}
    </ButtonBase>
  ));

  const captionLine =
    caption === undefined ? null : (
      <Typography variant="body2" component="p" sx={{ color: 'text.primary' }}>
        {caption}
      </Typography>
    );

  return (
    <Stack
      role="dialog"
      aria-modal
      aria-label={labels.dialog}
      tabIndex={-1}
      onKeyDown={gestures.onKeyDown}
      {...darkScheme}
      data-kk-loupe
      ref={focusOnMount}
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: (theme: Theme) => theme.zIndex.modal,
        bgcolor: gallery.darkroom,
        color: 'text.primary',
        outline: 'none',
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          columnGap: 1,
          px: 1,
          pt: 'max(env(safe-area-inset-top), 8px)',
          minHeight: kkTokens.shell.barHeight,
        }}
      >
        <KkIconButton label={labels.close} icon="close" onClick={intents.onClose} />
        <Stack sx={{ minWidth: 0, flex: 1 }}>
          <KkFilmEdge lead={counter} trail={scene} tone="gold" />
        </Stack>
        <KkButton
          variant="outlined"
          size="small"
          startIcon={<KkIcon name="download" size="small" />}
          onClick={intents.onDownload}
        >
          {labels.download}
        </KkButton>
      </Stack>
      <Box
        onPointerDown={gestures.onPointerDown}
        onPointerMove={gestures.onPointerMove}
        onPointerUp={gestures.onPointerUp}
        onPointerCancel={gestures.onPointerUp}
        sx={{ flex: 1, minHeight: 0, position: 'relative', touchAction: 'none' }}
      >
        <motion.div
          key={source ?? alt}
          initial={opening}
          animate={opened}
          transition={{ duration: gallery.loupe.openSeconds, ease: [0.2, 0.8, 0.2, 1] }}
          style={{ position: 'absolute', inset: 0, ...photoShift }}
        >
          {source === undefined ? (
            <KkLoupeLatent label={labels.developing} />
          ) : (
            <Box
              component="img"
              src={source}
              alt={alt}
              draggable={false}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
                userSelect: 'none',
              }}
            />
          )}
          {video === undefined || source === undefined ? null : (
            <KkLoupeFilm
              key={video.source}
              source={video.source}
              poster={source}
              duration={video.duration}
              playLabel={labels.play}
            />
          )}
        </motion.div>
      </Box>
      <Stack sx={{ rowGap: 1, px: 1.5, pt: 1, pb: 'max(env(safe-area-inset-bottom), 12px)' }}>
        <Stack direction="row" sx={{ alignItems: 'baseline', columnGap: 1.25, minWidth: 0 }}>
          <KkFlapCount value={time} variant="h2" tone="gold" />
          <Typography
            component="p"
            sx={(theme) => ({
              ...theme.typography.caption,
              fontWeight: 700,
              color: 'text.secondary',
              minWidth: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            })}
          >
            {facts}
          </Typography>
        </Stack>
        {captionLine}
        <Stack direction="row" sx={{ alignItems: 'center', columnGap: 0.5 }}>
          <KkIconButton
            label={labels.previousScene}
            icon="back"
            size="small"
            onClick={() => intents.onSceneStep(-1)}
          />
          <Stack
            direction="row"
            sx={{
              flex: 1,
              minWidth: 0,
              columnGap: `${gallery.gutter}px`,
              overflowX: 'auto',
              scrollbarWidth: 'none',
            }}
          >
            {stripFrames}
          </Stack>
          <KkIconButton
            label={labels.nextScene}
            icon="chevron"
            size="small"
            onClick={() => intents.onSceneStep(1)}
          />
        </Stack>
      </Stack>
    </Stack>
  );
};
