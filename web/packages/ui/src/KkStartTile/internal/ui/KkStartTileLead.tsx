import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import type { KkImageSource } from '../../../image-source';
import type { KkGroupTone } from '../../../internal/group-tone';
import { lineClamp } from '../../../internal/line-clamp';
import { usePrintRun } from '../../../internal/print-in/print-run';
import { inkBleedOf } from '../../../internal/print-in/print-stamp';
import type { KkIconName } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';
import { DISPLAY_NUMBER, EYEBROW, TILE_INNER_RADIUS, tilePressFill } from '../tile-paint';
import type { KkStartTileWhenTone } from '../when-tone';
import { whenInks } from '../when-tone';
import { KkStartTileProgress } from './KkStartTileProgress';
import { KkStartTileThumb } from './KkStartTileThumb';

const LIVE_DOT = '0.4375rem';
const META_LINES = 2;

const leadPaint = (theme: Theme): CSSObject => ({
  width: '100%',
  minWidth: 0,
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  gap: 1.5,
  p: 0.5,
  m: -0.5,
  textAlign: 'left',
  borderRadius: TILE_INNER_RADIUS,
  '&:active': tilePressFill(theme),
});

const TEXT_FRAME: CSSObject = { flex: 1, minWidth: 0, gap: 0.25, justifyContent: 'center' };
const WHEN_FRAME: CSSObject = { alignItems: 'center', gap: 1, minWidth: 0 };
const TITLE_PAINT: CSSObject = {
  ...lineClamp(2),
  fontWeight: 800,
  lineHeight: 1.2,
  letterSpacing: kkTokens.type.tracking.tight,
  textWrap: 'pretty',
  hyphens: 'auto',
};
const META_PAINT: CSSObject = {
  ...lineClamp(META_LINES),
  color: 'text.secondary',
  fontWeight: 600,
};

const liveBleedOf = (hidden: boolean, settled: boolean): CSSObject => ({
  ...inkBleedOf(hidden, settled),
  left: 0,
  top: `calc(50% - ${LIVE_DOT} / 2)`,
  width: LIVE_DOT,
  height: LIVE_DOT,
});

const eyebrowPaint =
  (tone: KkStartTileWhenTone, hidden: boolean, settled: boolean) =>
  (theme: Theme): CSSObject => ({
    ...EYEBROW,
    ...whenInks[tone](theme),
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.5,
    '&::before':
      tone === 'live'
        ? {
            content: '""',
            width: LIVE_DOT,
            height: LIVE_DOT,
            borderRadius: '50%',
            backgroundColor: 'currentColor',
          }
        : undefined,
    '&::after': tone === 'live' ? liveBleedOf(hidden, settled) : undefined,
  });

const TIME_PAINT: CSSObject = { ...DISPLAY_NUMBER, color: 'text.primary' };

interface KkStartTileLeadProps {
  image: KkImageSource | null;
  tone: KkGroupTone;
  icon: KkIconName;
  eyebrow: string;
  eyebrowTone: KkStartTileWhenTone;
  time: string;
  title: string;
  meta: string | null;
  progress: number | null;
  trailing?: ReactNode;
  label: string;
  onClick: () => void;
}

export const KkStartTileLead: FC<KkStartTileLeadProps> = ({
  image,
  tone,
  icon,
  eyebrow,
  eyebrowTone,
  time,
  title,
  meta,
  progress,
  trailing,
  label,
  onClick,
}) => {
  const metaLine =
    meta === null ? null : (
      <Typography component="span" variant="caption" sx={META_PAINT}>
        {meta}
      </Typography>
    );
  const progressLine = progress === null ? null : <KkStartTileProgress progress={progress} />;
  const { hidden, settled } = usePrintRun();

  return (
    <ButtonBase
      data-kk-start-tile-control
      data-kk-start-tile-lead
      aria-label={label}
      onClick={onClick}
      sx={leadPaint}
    >
      <KkStartTileThumb image={image} tone={tone} icon={icon} alt={title} size="large" />
      <Stack sx={TEXT_FRAME}>
        <Stack direction="row" sx={WHEN_FRAME}>
          <Typography
            component="span"
            variant="overline"
            noWrap
            sx={eyebrowPaint(eyebrowTone, hidden, settled)}
          >
            {eyebrow}
          </Typography>
          <Typography component="span" variant="h3" sx={TIME_PAINT}>
            {time}
          </Typography>
          {trailing}
        </Stack>
        <Typography component="span" variant="subtitle1" sx={TITLE_PAINT}>
          {title}
        </Typography>
        {metaLine}
        {progressLine}
      </Stack>
    </ButtonBase>
  );
};
