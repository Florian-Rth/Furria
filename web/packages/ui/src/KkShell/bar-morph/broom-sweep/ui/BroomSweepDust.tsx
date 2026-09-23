import type { FC } from 'react';
import { MOTE_COUNT } from '../logic/broom-sweep-frame';
import { BroomSweepMote } from './BroomSweepMote';

const MOTES = Array.from({ length: MOTE_COUNT }, (_, index) => (
  <BroomSweepMote key={index} index={index} />
));

export const BroomSweepDust: FC = () => MOTES;
