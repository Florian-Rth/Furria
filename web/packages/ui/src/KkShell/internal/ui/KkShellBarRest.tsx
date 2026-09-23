import Stack from '@mui/material/Stack';
import { motion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import type { KkBarMorph, KkBarMorphScene } from '../../bar-morph';
import type {
  KkScreenAction,
  KkScreenKind,
  KkScreenOrigin,
  KkScreenSearch,
} from '../../screen-declaration';
import { REST_READY, REST_WAITING } from '../logic/bar-search-motion';
import type { KkShellBarLead } from './KkShellBarLeading';
import { KkShellBarLeading } from './KkShellBarLeading';
import { KkShellBarTrailing } from './KkShellBarTrailing';

const REST_STYLE: CSSProperties = { display: 'flex', flex: 1, minWidth: 0 };

interface KkShellBarRestProps {
  kind: KkScreenKind;
  lead: KkShellBarLead;
  title: string;
  origin?: KkScreenOrigin;
  actions?: readonly KkScreenAction[];
  search?: KkScreenSearch;
  morph: KkBarMorph | null;
  scene: KkBarMorphScene;
}

export const KkShellBarRest: FC<KkShellBarRestProps> = ({
  kind,
  lead,
  title,
  origin,
  actions,
  search,
  morph,
  scene,
}) => {
  const leading =
    morph === null ? (
      <KkShellBarLeading kind={kind} lead={lead} title={title} origin={origin} />
    ) : (
      <morph.Leading key={scene.current.path} scene={scene} />
    );

  const entrance = morph === null ? REST_WAITING : false;

  return (
    <motion.div style={REST_STYLE} initial={entrance} animate={REST_READY}>
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, flex: 1, minWidth: 0 }}
      >
        {leading}
        <KkShellBarTrailing search={search} actions={actions} />
      </Stack>
    </motion.div>
  );
};
