import { kkTokens } from '@furria/ui';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import type { FC } from 'react';
import { changelogCopy } from '@/features/changelog/changelog-copy';
import { buildTriggerLabel } from '../logic/changelog-dialog-a11y';

interface ChangelogTriggerPillProps {
  unreadCount: number;
  onOpen: () => void;
}

export const ChangelogTriggerPill: FC<ChangelogTriggerPillProps> = ({ unreadCount, onOpen }) => (
  <Badge
    badgeContent={unreadCount}
    color="primary"
    sx={{ '& .MuiBadge-badge': { fontWeight: 800 } }}
  >
    <Button
      variant="outlined"
      color="primary"
      onClick={onOpen}
      aria-label={buildTriggerLabel(unreadCount)}
      sx={(theme) => ({
        minHeight: '2.75rem',
        px: 2.5,
        bgcolor: 'background.paper',
        boxShadow: kkTokens.shadow.raised,
        transition: theme.transitions.create(['background-color', 'border-color'], {
          duration: theme.transitions.duration.shortest,
        }),
        '&:hover': { bgcolor: 'background.paper' },
        '&.Mui-focusVisible': {
          outlineWidth: 2,
          outlineStyle: 'solid',
          outlineColor: (theme.vars ?? theme).palette.primary.main,
          outlineOffset: 2,
        },
      })}
    >
      {changelogCopy.triggerText}
    </Button>
  </Badge>
);
