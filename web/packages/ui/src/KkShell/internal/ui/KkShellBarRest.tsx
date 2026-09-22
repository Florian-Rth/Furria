import Stack from '@mui/material/Stack';
import { motion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
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
}

export const KkShellBarRest: FC<KkShellBarRestProps> = ({
  kind,
  lead,
  title,
  origin,
  actions,
  search,
}) => (
  <motion.div style={REST_STYLE} initial={REST_WAITING} animate={REST_READY}>
    <Stack
      direction="row"
      sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, flex: 1, minWidth: 0 }}
    >
      <KkShellBarLeading kind={kind} lead={lead} title={title} origin={origin} />
      <KkShellBarTrailing search={search} actions={actions} />
    </Stack>
  </motion.div>
);
