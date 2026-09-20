import { kkMotion } from '@furria/ui';
import Grid from '@mui/material/Grid';
import { motion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import type { GroupSummary } from '../schemas';
import { GroupCard } from './GroupCard';

const FULL_HEIGHT = { height: '100%' } as const;
const CARD_STYLE: CSSProperties = { height: '100%' };
const CARD_SIZE = { xs: 6, sm: 4, desktop: 3 };
const GRID_SPACING = { xs: 1.5, desktop: 2.5 };

interface GroupsGridProps {
  groups: readonly GroupSummary[];
}

export const GroupsGrid: FC<GroupsGridProps> = ({ groups }) => (
  <Grid container spacing={GRID_SPACING} sx={{ minWidth: 0 }}>
    {groups.map((group) => (
      <Grid key={group.groupId} size={CARD_SIZE} sx={{ minWidth: 0 }}>
        <motion.div
          layout="position"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={kkMotion.layoutGlide}
          style={CARD_STYLE}
        >
          <GroupCard group={group} sx={FULL_HEIGHT} />
        </motion.div>
      </Grid>
    ))}
  </Grid>
);
