import Stack from '@mui/material/Stack';
import { motion } from 'motion/react';
import type { FC, PropsWithChildren } from 'react';
import { kkMotion } from '../../../kk-motion';

const HIDDEN = { opacity: 0 };
const SHOWN = { opacity: 1 };

export const KkPaneLayoutPaneBody: FC<PropsWithChildren> = ({ children }) => (
  <motion.div initial={HIDDEN} animate={SHOWN} transition={kkMotion.arrive}>
    <Stack sx={{ gap: 1.5, p: 1.5, minWidth: 0 }}>{children}</Stack>
  </motion.div>
);
