import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import type { FC, KeyboardEvent } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { percentOf } from '../../../internal/score-paint';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkTimelineDiamondProps {
  share: number;
  selected: boolean;
  dimmed: boolean;
  label: string;
  onPress: () => void;
  onNudge: (direction: -1 | 1) => void;
}

export const KkTimelineDiamond: FC<KkTimelineDiamondProps> = ({
  share,
  selected,
  dimmed,
  label,
  onPress,
  onNudge,
}) => {
  const press = (event: KeyboardEvent<HTMLElement>): void => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    onNudge(event.key === 'ArrowLeft' ? -1 : 1);
  };

  return (
    <ButtonBase
      aria-label={label}
      aria-pressed={selected}
      onClick={onPress}
      onKeyDown={press}
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
};
