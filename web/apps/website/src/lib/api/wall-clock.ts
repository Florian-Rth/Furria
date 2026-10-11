import { z } from 'zod';
import { toBerlinWallClock } from '@/lib/date';

export const WallClockSchema = z.iso.datetime({ offset: true }).transform(toBerlinWallClock);
