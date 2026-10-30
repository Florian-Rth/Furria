import StarRoundedIcon from '@mui/icons-material/StarRounded';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { goldInkOf } from '../../../internal/gold-ink';
import { kkTokens } from '../../../tokens';
import { placeOf } from '../logic/studio-g-lane-kinds';
import type { KkStudioGDrag } from '../logic/use-drag-delta';
import { useDragDelta } from '../logic/use-drag-delta';

export type KkStudioGBlockKind = 'part' | 'step' | 'video';

const GAP: Record<KkStudioGBlockKind, string> = { part: '2px', step: '1px', video: '2px' };
const PART_GAP = '0.375rem';
const NARROW = '@container (max-width: 3.25rem)';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const restPaint = (kind: KkStudioGBlockKind, theme: Theme): CSSObject => {
  if (kind === 'step') {
    return {
      backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 9%, transparent)`,
      color: palette(theme).text.primary,
    };
  }
  if (kind === 'video') {
    return {
      backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 5%, transparent)`,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
      color: palette(theme).text.primary,
    };
  }

  return { backgroundColor: 'transparent', color: palette(theme).text.secondary };
};

const selectedPaint = (theme: Theme): CSSObject => ({
  backgroundColor: palette(theme).text.primary,
  color: palette(theme).background.paper,
  boxShadow: `0 0 0 ${kkTokens.line.section}px ${palette(theme).background.paper}, 0 0 0 ${kkTokens.line.section * 2}px ${palette(theme).text.primary}`,
  zIndex: 2,
});

interface KkStudioGTimelineBlockProps {
  kind: KkStudioGBlockKind;
  start: number;
  end: number;
  number?: number;
  text: string;
  label: string;
  selected: boolean;
  opensPart?: boolean;
  main?: boolean;
  attention?: boolean;
  onSelect: () => void;
  onDrag?: KkStudioGDrag | null;
}

export const KkStudioGTimelineBlock: FC<KkStudioGTimelineBlockProps> = ({
  kind,
  start,
  end,
  number,
  text,
  label,
  selected,
  opensPart = false,
  main = false,
  attention = false,
  onSelect,
  onDrag = null,
}) => {
  const drag = useDragDelta(onDrag);
  const star = main ? <StarRoundedIcon /> : null;
  const numeral =
    number === undefined ? null : (
      <Typography
        component="span"
        variant="caption"
        sx={{
          fontWeight: 900,
          fontVariantNumeric: 'tabular-nums',
          color: 'inherit',
          lineHeight: 1,
        }}
      >
        {number}
      </Typography>
    );

  return (
    <ButtonBase
      aria-label={label}
      aria-pressed={selected}
      onClick={onSelect}
      {...drag}
      data-kk-studio-g-block={kind}
      data-selected={selected}
      style={placeOf(start, end)}
      sx={(theme) => ({
        position: 'absolute',
        top: kind === 'part' ? 0 : '1px',
        bottom: kind === 'part' ? 0 : '1px',
        pl: opensPart ? PART_GAP : GAP[kind],
        pr: GAP[kind],
        cursor: drag === null ? 'pointer' : 'grab',
        touchAction: 'none',
        borderRadius: `${kkTokens.radius.bar}px`,
        ...focusRing(theme),
      })}
    >
      <Typography
        component="span"
        variant="caption"
        noWrap
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          width: '100%',
          height: '100%',
          px: 0.625,
          containerType: 'inline-size',
          borderRadius: `${kkTokens.radius.bar}px`,
          fontWeight: 700,
          lineHeight: 1,
          textAlign: 'left',
          borderTop:
            kind === 'part'
              ? `${kkTokens.line.section}px solid ${palette(theme).text.primary}`
              : 'none',
          transition:
            'background-color 160ms ease-out, color 160ms ease-out, box-shadow 160ms ease-out',
          '& svg': { width: '0.875rem', height: '0.875rem', flexShrink: 0 },
          ...restPaint(kind, theme),
          ...(attention ? { ...goldInkOf(theme), borderStyle: 'dashed' } : {}),
          ...(selected ? selectedPaint(theme) : {}),
          [NARROW]: { '& [data-kk-studio-g-block-text]': { display: 'none' } },
        })}
      >
        {star}
        {numeral}
        <Typography
          component="span"
          variant="caption"
          noWrap
          data-kk-studio-g-block-text
          sx={{ fontWeight: 'inherit', color: 'inherit', lineHeight: 1, minWidth: 0 }}
        >
          {text}
        </Typography>
      </Typography>
    </ButtonBase>
  );
};
