import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';
import { percentOf } from '../lane-geometry';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkLaneTrackDiamondProps {
  share: number;
  selected: boolean;
  dimmed: boolean;
  label: string;
  onPress: () => void;
}

export const KkLaneTrackDiamond: FC<KkLaneTrackDiamondProps> = ({
  share,
  selected,
  dimmed,
  label,
  onPress,
}) => (
  <ButtonBase
    aria-label={label}
    aria-pressed={selected}
    onClick={onPress}
    data-selected={selected}
    data-dimmed={dimmed}
    style={{ left: percentOf(share) }}
    sx={(theme) => ({
      position: 'absolute',
      top: '50%',
      width: '1.25rem',
      height: kkTokens.tapTarget,
      transform: 'translate(-50%, -50%)',
      zIndex: selected ? 2 : 1,
      '&[data-dimmed="true"]': { opacity: 0.35 },
      ...focusRing(theme),
    })}
  >
    <Box
      aria-hidden
      sx={(theme) => ({
        width: '0.625rem',
        height: '0.625rem',
        transform: 'rotate(45deg)',
        borderRadius: '0.0625rem',
        backgroundColor: palette(theme).background.paper,
        boxShadow: `inset 0 0 0 ${kkTokens.line.section}px ${palette(theme).text.primary}`,
        '[data-selected="true"] > &': {
          backgroundColor: palette(theme).primary.main,
          boxShadow: `inset 0 0 0 ${kkTokens.line.section}px ${palette(theme).primary.main}`,
          width: '0.8125rem',
          height: '0.8125rem',
        },
      })}
    />
  </ButtonBase>
);
