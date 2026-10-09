import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { TargetAndTransition, Transition } from 'motion/react';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { focusRing } from '../internal/focus-ring';
import { useReducedMotion } from '../internal/use-reduced-motion';
import { KkButton } from '../KkButton';
import { KkConfettiBurst } from '../KkConfettiBurst';
import { KkFilmEdge } from '../KkFilmEdge';
import { KkFlapCount } from '../KkFlapCount';
import { KkGreaseMark } from '../KkGreaseMark';
import { KkIcon } from '../KkIcon';
import { KkIconButton } from '../KkIconButton';
import { KK_DARK_SCHEME_ATTRIBUTE } from '../theme';
import { kkTokens } from '../tokens';
import type { KkLightTableIntents } from './use-light-table-gestures';
import { useLightTableGestures } from './use-light-table-gestures';

const { gallery } = kkTokens;
const { cull } = gallery;
const darkScheme = { [KK_DARK_SCHEME_ATTRIBUTE]: '' };
const MILLISECONDS = 1000;
const STRIP_FRAME = 44;
const SLOT_SHIFT = 33;

const focusOnMount = (node: HTMLDivElement | null): void => {
  node?.focus();
};

export interface KkLightTableFrame {
  id: string;
  label: string;
  source: string;
}

export interface KkLightTableStripFrame extends KkLightTableFrame {
  verdict: 'open' | 'rejected' | 'filed';
  slot: number | null;
  current: boolean;
}

export interface KkLightTableTarget {
  id: string;
  title: string;
  count: string;
}

export interface KkLightTableDeparture {
  key: number;
  source: string;
  kind: 'reject' | 'file';
  slot: number;
  stamp: string;
}

export interface KkLightTableLabels {
  dialog: string;
  close: string;
  undo: string;
  reject: string;
  confirm: string;
  cancel: string;
  settings?: string;
}

export interface KkLightTableCommit {
  label: string;
  busy: boolean;
}

export interface KkLightTableDone {
  headline: string;
  summary: string;
}

interface KkLightTableProps extends KkLightTableIntents {
  title: string;
  remaining: string;
  tally: string;
  scene: string;
  position: string;
  hint: string;
  frame: KkLightTableFrame | null;
  departure: KkLightTableDeparture | null;
  strip: readonly KkLightTableStripFrame[];
  targets: readonly KkLightTableTarget[];
  confirmQuestion: string | null;
  hurried: boolean;
  done: KkLightTableDone | null;
  commit?: KkLightTableCommit | null;
  labels: KkLightTableLabels;
  onClose: () => void;
  onStripSelect: (id: string) => void;
  onCommit?: () => void;
  onSettings?: () => void;
}

const seconds = (milliseconds: number, hurried: boolean): number =>
  (hurried ? cull.hurriedMs : milliseconds) / MILLISECONDS;

const departureMotion = (
  departure: KkLightTableDeparture,
  hurried: boolean,
  reducedMotion: boolean,
): { animate: TargetAndTransition; transition: Transition } => {
  if (reducedMotion) {
    return { animate: { opacity: 0 }, transition: { duration: 0.12 } };
  }
  if (departure.kind === 'reject') {
    return {
      animate: { y: '55%', rotate: cull.tiltDeg, opacity: 0 },
      transition: {
        delay: seconds(cull.rejectStrokeMs, hurried),
        duration: seconds(cull.rejectDropMs, hurried),
        ease: 'easeIn',
      },
    };
  }
  return {
    animate: {
      x: `${(departure.slot - 1) * SLOT_SHIFT}%`,
      y: '78%',
      scale: 0.12,
      opacity: 0.2,
    },
    transition: {
      delay: seconds(cull.stampMs, hurried) + 0.06,
      duration: seconds(cull.fileFlightMs, hurried),
      ease: [0.4, 0, 0.2, 1],
    },
  };
};

export const KkLightTable: FC<KkLightTableProps> = ({
  title,
  remaining,
  tally,
  scene,
  position,
  hint,
  frame,
  departure,
  strip,
  targets,
  confirmQuestion,
  hurried,
  done,
  commit = null,
  labels,
  onClose,
  onStripSelect,
  onCommit,
  onSettings,
  ...intents
}) => {
  const reducedMotion = useReducedMotion();
  const gestures = useLightTableGestures(intents);
  const entering = reducedMotion ? { opacity: 0 } : { opacity: 0, x: 36 };
  const enterTransition = { duration: seconds(cull.nextMs, hurried), ease: 'easeOut' } as const;
  const departing = departure === null ? null : departureMotion(departure, hurried, reducedMotion);
  const dragStyle = { x: gestures.drag.x, y: gestures.drag.y * 0.6 };
  const rejectIntent = (): void => intents.onReject(false);
  const stripFrames = strip.map((item) => (
    <ButtonBase
      key={item.id}
      aria-label={item.label}
      aria-current={item.current || undefined}
      onClick={() => onStripSelect(item.id)}
      sx={(theme: Theme) => ({
        position: 'relative',
        flex: `0 0 ${STRIP_FRAME}px`,
        height: STRIP_FRAME,
        opacity: item.verdict === 'open' ? 1 : 0.4,
        outline: item.current ? `${kkTokens.line.section}px solid` : 'none',
        outlineColor: (theme.vars ?? theme).palette.warning.main,
        outlineOffset: -kkTokens.line.section,
        ...focusRing(theme),
      })}
    >
      <Box
        component="img"
        src={item.source}
        alt=""
        sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      {item.verdict === 'rejected' ? (
        <KkGreaseMark kind="cross" sx={{ position: 'absolute', inset: '10%' }} />
      ) : null}
      {item.verdict === 'filed' ? (
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
          {item.slot}
        </Typography>
      ) : null}
    </ButtonBase>
  ));
  const targetButtons = targets.map((target, slot) => (
    <ButtonBase
      key={target.id}
      onClick={() => intents.onFile(slot, false)}
      aria-label={target.title}
      sx={(theme: Theme) => ({
        flex: 1,
        minWidth: 0,
        minHeight: gallery.target.minHeight,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        px: 1,
        py: 0.75,
        borderRadius: `${kkTokens.radius.base}px`,
        border: `${kkTokens.line.hair}px solid`,
        borderColor: 'divider',
        bgcolor: gallery.darkroomEdge,
        textAlign: 'left',
        ...focusRing(theme),
      })}
    >
      <Stack direction="row" sx={{ alignItems: 'baseline', columnGap: 0.75, width: '100%' }}>
        <Typography
          component="span"
          sx={(theme) => ({
            ...theme.typography.overline,
            fontFamily: kkTokens.font.display,
            lineHeight: 1,
            color: 'warning.main',
          })}
        >
          {slot + 1}
        </Typography>
        <KkFlapCount value={target.count} variant="h4" sx={{ ml: 'auto' }} />
      </Stack>
      <Typography
        component="span"
        sx={(theme) => ({
          ...theme.typography.caption,
          fontWeight: 800,
          lineHeight: 1.2,
          color: 'text.secondary',
          width: '100%',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        })}
      >
        {target.title}
      </Typography>
    </ButtonBase>
  ));

  return (
    <Stack
      ref={focusOnMount}
      role="application"
      aria-label={labels.dialog}
      tabIndex={0}
      onKeyDown={gestures.onKeyDown}
      {...darkScheme}
      data-kk-light-table
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: (theme: Theme) => theme.zIndex.modal,
        bgcolor: gallery.darkroom,
        color: 'text.primary',
        outline: 'none',
        borderTop: `${kkTokens.line.page}px solid`,
        borderTopColor: 'primary.main',
      }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'center', columnGap: 1, px: 1, pt: 'max(env(safe-area-inset-top), 6px)' }}
      >
        <KkIconButton label={labels.close} icon="close" onClick={onClose} />
        <Stack sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" sx={{ alignItems: 'baseline', columnGap: 1, minWidth: 0 }}>
            <KkFilmEdge lead={title} tone="red" level="h2" />
            <KkFlapCount value={remaining} variant="h3" />
          </Stack>
          <Typography
            component="p"
            sx={(theme) => ({
              ...theme.typography.caption,
              fontWeight: 700,
              color: 'text.secondary',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            })}
          >
            {tally}
          </Typography>
        </Stack>
        {onSettings === undefined || labels.settings === undefined ? null : (
          <KkIconButton label={labels.settings} icon="settings" onClick={onSettings} />
        )}
        <KkIconButton label={labels.undo} icon="undo" onClick={intents.onUndo} />
      </Stack>
      <KkFilmEdge
        lead={scene}
        trail={position}
        tone="gold"
        sprockets
        sx={{ px: 1.5, pt: 1.25, pb: 0.5 }}
      />
      <Box
        onPointerDown={gestures.onPointerDown}
        onPointerMove={gestures.onPointerMove}
        onPointerUp={gestures.onPointerUp}
        onPointerCancel={gestures.onPointerUp}
        sx={{ flex: 1, minHeight: 0, position: 'relative', touchAction: 'none', mx: 1 }}
      >
        {frame === null ? null : (
          <motion.div
            key={frame.id}
            initial={entering}
            animate={{ opacity: 1, x: 0 }}
            transition={enterTransition}
            style={{ position: 'absolute', inset: 0, ...dragStyle }}
          >
            <Box
              component="img"
              src={frame.source}
              alt={frame.label}
              draggable={false}
              sx={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
          </motion.div>
        )}
        {departure === null || departing === null ? null : (
          <motion.div
            key={departure.key}
            initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
            animate={departing.animate}
            transition={departing.transition}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          >
            <Box
              component="img"
              src={departure.source}
              alt=""
              sx={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
            {departure.kind === 'reject' ? (
              <KkGreaseMark kind="cross" sx={{ position: 'absolute', inset: '18%' }} />
            ) : (
              <Stack
                sx={{
                  position: 'absolute',
                  inset: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  component="span"
                  variant="h1"
                  sx={{
                    color: 'warning.main',
                    border: `${kkTokens.line.page}px solid`,
                    borderColor: 'warning.main',
                    borderRadius: `${kkTokens.radius.bar * 2}px`,
                    px: 1.5,
                    py: 0.5,
                    transform: 'rotate(-7deg)',
                    textTransform: 'uppercase',
                    bgcolor: 'rgba(5,6,8,0.55)',
                  }}
                >
                  {departure.stamp}
                </Typography>
              </Stack>
            )}
          </motion.div>
        )}
        {done === null ? null : (
          <Stack
            sx={{
              position: 'absolute',
              inset: 0,
              alignItems: 'center',
              justifyContent: 'center',
              rowGap: 1,
              textAlign: 'center',
            }}
          >
            <KkConfettiBurst fireKey={1} count={28} />
            <KkFlapCount value={done.headline} variant="h2" tone="gold" />
            <Typography variant="h4" component="p" sx={{ color: 'text.secondary' }}>
              {done.summary}
            </Typography>
          </Stack>
        )}
        {confirmQuestion === null ? null : (
          <Stack
            direction="row"
            role="alertdialog"
            aria-label={confirmQuestion}
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 8,
              mx: 'auto',
              width: 'fit-content',
              maxWidth: '100%',
              alignItems: 'center',
              columnGap: 1,
              px: 1.5,
              py: 1,
              borderRadius: `${kkTokens.radius.base}px`,
              bgcolor: 'background.paper',
              boxShadow: kkTokens.shadow.floating,
            }}
          >
            <Typography variant="subtitle2" component="p">
              {confirmQuestion}
            </Typography>
            <KkButton size="small" tone="danger" onClick={intents.onConfirm}>
              {labels.confirm}
            </KkButton>
            <KkButton size="small" variant="text" onClick={intents.onCancel}>
              {labels.cancel}
            </KkButton>
          </Stack>
        )}
      </Box>
      <Stack
        direction="row"
        sx={{
          columnGap: `${gallery.gutter}px`,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          px: 1,
          pt: 1,
        }}
      >
        {stripFrames}
      </Stack>
      {commit === null || onCommit === undefined ? null : (
        <ButtonBase
          onClick={onCommit}
          disabled={commit.busy}
          sx={(theme: Theme) => ({
            mt: 1,
            mx: 1,
            minHeight: kkTokens.tapTarget,
            columnGap: 1,
            borderRadius: `${kkTokens.radius.base}px`,
            bgcolor: 'warning.main',
            color: 'warning.contrastText',
            opacity: commit.busy ? 0.6 : 1,
            ...focusRing(theme),
          })}
        >
          <KkIcon name="check" size="small" />
          <Typography
            component="span"
            sx={(theme) => ({
              ...theme.typography.overline,
              fontWeight: 900,
              letterSpacing: kkTokens.type.tracking.label,
              textTransform: 'uppercase',
            })}
          >
            {commit.label}
          </Typography>
        </ButtonBase>
      )}
      <Stack direction="row" sx={{ columnGap: 0.75, px: 1, pt: 1 }}>
        {targetButtons}
      </Stack>
      <ButtonBase
        onClick={rejectIntent}
        sx={(theme: Theme) => ({
          mt: 1,
          mx: 1,
          mb: 'max(env(safe-area-inset-bottom), 8px)',
          minHeight: kkTokens.tapTarget,
          borderRadius: `${kkTokens.radius.base}px`,
          borderTop: `${kkTokens.line.section}px solid`,
          borderTopColor: 'primary.main',
          color: 'primary.main',
          columnGap: 1,
          ...focusRing(theme),
        })}
      >
        <KkIcon name="delete" size="small" />
        <Typography
          component="span"
          sx={(theme) => ({
            ...theme.typography.overline,
            fontWeight: 900,
            letterSpacing: kkTokens.type.tracking.label,
            textTransform: 'uppercase',
          })}
        >
          {labels.reject}
        </Typography>
        <Typography
          component="span"
          sx={(theme) => ({
            ...theme.typography.caption,
            fontWeight: 600,
            color: 'text.disabled',
            display: { xs: 'none', desktop: 'inline' },
          })}
        >
          {hint}
        </Typography>
      </ButtonBase>
    </Stack>
  );
};
