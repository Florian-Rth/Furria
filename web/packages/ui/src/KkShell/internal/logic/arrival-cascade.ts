import type { CSSObject } from '@mui/material/styles';
import { kkTokens } from '../../../tokens';

const { screen } = kkTokens.shell;
const FIRST_BLOCK = 1;
const ARRIVAL = `kk-screen-arrival ${screen.arrivalSeconds}s ease-out both`;

const delayAt = (step: number): CSSObject => ({
  animationDelay: `${(step * screen.arrivalStepSeconds).toFixed(3)}s`,
});

export const arrivalCascadeOf = (selector: string, blocks: number): Record<string, CSSObject> => {
  const staggered = Array.from({ length: blocks }, (_, step) => [
    `${selector}:nth-of-type(${step + FIRST_BLOCK})`,
    delayAt(step),
  ]);
  const trailing = [`${selector}:nth-of-type(n + ${blocks + FIRST_BLOCK})`, delayAt(blocks - 1)];

  return {
    [selector]: { animation: ARRIVAL },
    ...Object.fromEntries([...staggered, trailing]),
  };
};
