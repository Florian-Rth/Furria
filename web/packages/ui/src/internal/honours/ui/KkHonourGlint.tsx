import { motion } from 'motion/react';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { glintTransition, VIEW_BOX_ORIGIN } from '../honour-motion';
import { partIdOf, urlOf } from '../svg-id';

const GLINT = kkTokens.shell.material.glint;
const GLINT_FROM = { opacity: 0, rotate: -30 } as const;
const GLINT_TO = { opacity: [0, 0.85, 0.7, 0], rotate: [-30, 42, 258, 330] };

interface KkHonourGlintProps {
  prefix: string;
  box: number;
  litPaths: readonly string[];
  litWidth: number;
  path: string;
  strokeWidth: number;
  delay: number;
}

export const KkHonourGlint: FC<KkHonourGlintProps> = ({
  prefix,
  box,
  litPaths,
  litWidth,
  path,
  strokeWidth,
  delay,
}) => {
  const maskId = partIdOf(prefix, 'glint');
  const maskUrl = urlOf(maskId);
  const transition = glintTransition(delay);
  const lit = litPaths.map((litPath) => (
    <path key={litPath} d={litPath} fill="none" stroke={GLINT} strokeWidth={litWidth} />
  ));

  return (
    <>
      <mask id={maskId} maskUnits="userSpaceOnUse" x={0} y={0} width={box} height={box}>
        {lit}
      </mask>
      <g mask={maskUrl}>
        <motion.path
          d={path}
          fill="none"
          stroke={GLINT}
          strokeWidth={strokeWidth}
          initial={GLINT_FROM}
          animate={GLINT_TO}
          transition={transition}
          style={VIEW_BOX_ORIGIN}
        />
      </g>
    </>
  );
};
