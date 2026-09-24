import Stack from '@mui/material/Stack';
import { motion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import type { KkScreenAction, KkScreenSearch } from '../../screen-declaration';
import { BroomSweepLeading } from '../broom-sweep/BroomSweepLeading';
import type { KkBarScene } from '../logic/bar-scene';
import { REST_READY, REST_WAITING } from '../logic/bar-search-motion';
import { useBarDebut } from '../logic/use-bar-debut';
import { KkShellBarTrailing } from './KkShellBarTrailing';

const REST_STYLE: CSSProperties = { display: 'flex', flex: 1, minWidth: 0 };

interface KkShellBarRestProps {
  actions?: readonly KkScreenAction[];
  search?: KkScreenSearch;
  scene: KkBarScene;
}

export const KkShellBarRest: FC<KkShellBarRestProps> = ({ actions, search, scene }) => {
  const debut = useBarDebut(scene);
  const entrance = debut ? false : REST_WAITING;

  return (
    <motion.div style={REST_STYLE} initial={entrance} animate={REST_READY}>
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, flex: 1, minWidth: 0 }}
      >
        <BroomSweepLeading scene={scene} debut={debut} />
        <KkShellBarTrailing search={search} actions={actions} />
      </Stack>
    </motion.div>
  );
};
