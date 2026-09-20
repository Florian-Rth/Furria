import type { FC } from 'react';
import { Stage202627 } from './Stage202627';

const SCENES: Record<number, FC> = { 2026: Stage202627 };

export const sceneForSession = (startYear: number): FC | undefined => SCENES[startYear];
