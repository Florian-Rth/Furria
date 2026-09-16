import { kkMotion } from '@furria/ui';
import Grid from '@mui/material/Grid';
import { motion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import type { GroupStanding } from '../groups-labels';
import type { GroupSummary } from '../schemas';
import { GroupCard } from './GroupCard';

const FULL_HEIGHT = { height: '100%' } as const;

const CARD_STYLE: CSSProperties = { height: '100%' };

interface GroupsGridProps {
  groups: readonly GroupSummary[];
  standings: Map<number, GroupStanding>;
}

export const GroupsGrid: FC<GroupsGridProps> = ({ groups, standings }) => (
  <Grid container spacing={{ xs: 2, desktop: 2.5 }} sx={{ minWidth: 0 }}>
    {groups.map((group) => (
      <Grid key={group.groupId} size={{ xs: 12, sm: 6, desktop: 4 }} sx={{ minWidth: 0 }}>
        <motion.div
          layout="position"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={kkMotion.layoutGlide}
          style={CARD_STYLE}
        >
          <GroupCard group={group} standing={standings.get(group.groupId)} sx={FULL_HEIGHT} />
        </motion.div>
      </Grid>
    ))}
  </Grid>
);
