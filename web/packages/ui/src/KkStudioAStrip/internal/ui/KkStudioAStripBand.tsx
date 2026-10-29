import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PointerEvent } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { redInk } from '../../../internal/red-ink';
import { KkStudioAGlyph } from '../../../KkStudioAGlyph/KkStudioAGlyph';

export type KkStudioAStripBandState = 'current' | 'looped' | 'rest';

export interface KkStudioAStripBandItem {
  key: string;
  from: number;
  to: number;
  label: string;
  actionLabel: string;
  state: KkStudioAStripBandState;
  onSelect: () => void;
}

const PERCENT = 100;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const bandPaints: Record<KkStudioAStripBandState, (theme: Theme) => CSSObject> = {
  current: (theme) => ({
    color: palette(theme).text.primary,
    backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 9%, transparent)`,
    boxShadow: `inset 0 -2px 0 ${palette(theme).primary.main}`,
  }),
  looped: (theme) => ({
    ...redInk(theme),
    backgroundColor: `color-mix(in srgb, ${palette(theme).primary.main} 16%, transparent)`,
    boxShadow: `inset 0 -2px 0 ${palette(theme).primary.main}`,
  }),
  rest: (theme) => ({
    color: palette(theme).text.secondary,
    backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 5%, transparent)`,
  }),
};

const keepFromScrub = (event: PointerEvent<HTMLButtonElement>): void => {
  event.stopPropagation();
};

interface KkStudioAStripBandProps {
  items: readonly KkStudioAStripBandItem[];
}

export const KkStudioAStripBand: FC<KkStudioAStripBandProps> = ({ items }) => {
  const segments = items.map((item) => {
    const loopMark = item.state === 'looped' ? <KkStudioAGlyph name="loop" size="0.75rem" /> : null;

    return (
      <ButtonBase
        key={item.key}
        aria-label={item.actionLabel}
        aria-pressed={item.state === 'looped'}
        onPointerDown={keepFromScrub}
        onClick={item.onSelect}
        data-kk-studio-a-band={item.state}
        style={{
          left: `${item.from * PERCENT}%`,
          width: `calc(${(item.to - item.from) * PERCENT}% - 2px)`,
        }}
        sx={(theme) => ({
          position: 'absolute',
          top: 0,
          bottom: 0,
          justifyContent: 'flex-start',
          gap: 0.5,
          px: 0.75,
          borderRadius: '4px',
          minWidth: 0,
          transition: 'background-color .2s, color .2s',
          ...focusRing(theme),
          ...bandPaints[item.state](theme),
        })}
      >
        {loopMark}
        <Typography
          component="span"
          variant="caption"
          sx={{
            fontWeight: 800,
            lineHeight: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minWidth: 0,
          }}
        >
          {item.label}
        </Typography>
      </ButtonBase>
    );
  });

  return <Box sx={{ position: 'absolute', inset: 0 }}>{segments}</Box>;
};
