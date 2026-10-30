import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';
import { placeOf } from '../logic/studio-g-lane-kinds';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioGTimelineSongProps {
  start: number;
  end: number;
  number: number;
  name: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
}

export const KkStudioGTimelineSong: FC<KkStudioGTimelineSongProps> = ({
  start,
  end,
  number,
  name,
  label,
  selected,
  onSelect,
}) => (
  <ButtonBase
    aria-label={label}
    aria-pressed={selected}
    onClick={onSelect}
    data-kk-studio-g-song
    data-selected={selected}
    style={placeOf(start, end)}
    sx={(theme) => ({
      position: 'absolute',
      top: 0,
      bottom: 0,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      borderRadius: `${kkTokens.radius.bar}px`,
      backgroundColor: selected
        ? `color-mix(in srgb, ${palette(theme).text.primary} 10%, transparent)`
        : 'transparent',
      outline: `${kkTokens.line.section}px solid`,
      outlineColor: selected ? palette(theme).text.primary : 'transparent',
      outlineOffset: -kkTokens.line.section,
      transition: 'background-color 160ms ease-out, outline-color 160ms ease-out',
      ...focusRing(theme),
    })}
  >
    <Typography
      component="span"
      variant="caption"
      noWrap
      sx={(theme) => ({
        position: 'sticky',
        left: 0,
        maxWidth: '100%',
        mt: 0.25,
        ml: 0.5,
        px: 0.5,
        borderRadius: `${kkTokens.radius.bar}px`,
        lineHeight: 1.3,
        fontWeight: 800,
        backgroundColor: selected ? palette(theme).text.primary : palette(theme).background.paper,
        color: selected ? palette(theme).background.paper : palette(theme).text.primary,
      })}
    >
      {`${number} · ${name}`}
    </Typography>
  </ButtonBase>
);
