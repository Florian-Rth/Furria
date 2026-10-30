import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkEightsReelCountProps {
  column: number;
  count: number;
  seconds: number;
  label: string;
  lit: boolean;
  keyed: boolean;
  onSeek: (seconds: number) => void;
}

export const KkEightsReelCount: FC<KkEightsReelCountProps> = ({
  column,
  count,
  seconds,
  label,
  lit,
  keyed,
  onSeek,
}) => {
  const seek = (): void => {
    onSeek(seconds);
  };
  const place = { gridColumn: String(column + 1) };
  const node = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const cell = node.current;
    const box = cell?.parentElement;
    if (!lit || cell === null || box === null || box === undefined) {
      return;
    }
    const top = cell.offsetTop - box.offsetTop;
    if (top < box.scrollTop || top + cell.offsetHeight > box.scrollTop + box.clientHeight) {
      box.scrollTop = top;
    }
  }, [lit]);

  return (
    <ButtonBase
      ref={node}
      aria-label={label}
      aria-current={lit ? 'time' : undefined}
      data-lit={lit}
      data-keyed={keyed}
      data-downbeat={count === 1}
      onClick={seek}
      style={place}
      sx={(theme) => ({
        position: 'relative',
        minWidth: 0,
        borderRadius: `${kkTokens.radius.bar}px`,
        color: palette(theme).text.secondary,
        backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 7%, transparent)`,
        '&[data-downbeat="true"]': {
          color: palette(theme).text.primary,
          boxShadow: `inset ${kkTokens.line.section}px 0 0 ${palette(theme).text.primary}`,
        },
        '&[data-lit="true"]': {
          color: palette(theme).primary.contrastText,
          backgroundColor: palette(theme).primary.main,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '0.1875rem',
          right: '0.1875rem',
          width: '0.3125rem',
          height: '0.3125rem',
          transform: 'rotate(45deg)',
        },
        '&[data-keyed="true"]::after': { backgroundColor: 'currentColor' },
        ...focusRing(theme),
      })}
    >
      <Typography
        component="span"
        variant="caption"
        sx={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}
      >
        {count}
      </Typography>
    </ButtonBase>
  );
};
