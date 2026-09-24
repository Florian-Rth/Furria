import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { moteOpacityVar, moteVar, varOf } from '../logic/broom-sweep-vars';

const confettiShape = (theme: Theme): CSSObject => ({
  width: theme.spacing(0.5),
  height: theme.spacing(1),
  borderRadius: theme.spacing(0.125),
  backgroundColor: (theme.vars ?? theme).palette.primary.main,
});

const goldShape = (theme: Theme): CSSObject => ({
  ...confettiShape(theme),
  backgroundColor: (theme.vars ?? theme).palette.warning.main,
});

const dustShape = (theme: Theme): CSSObject => ({
  width: theme.spacing(0.625),
  height: theme.spacing(0.625),
  borderRadius: '50%',
  backgroundColor: (theme.vars ?? theme).palette.text.disabled,
});

const SHAPES = [confettiShape, dustShape, goldShape] as const;

interface BroomSweepMoteProps {
  index: number;
}

export const BroomSweepMote: FC<BroomSweepMoteProps> = ({ index }) => {
  const shape = SHAPES[index % SHAPES.length] ?? dustShape;

  return (
    <Box
      sx={(theme) => ({
        position: 'absolute',
        left: 0,
        top: '50%',
        ...shape(theme),
        transform: varOf(moteVar(index), 'none'),
        opacity: varOf(moteOpacityVar(index), '0'),
      })}
    />
  );
};
