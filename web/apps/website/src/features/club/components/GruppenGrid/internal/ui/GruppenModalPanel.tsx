import { KkPhotoPlaceholder, kkTokens } from '@furria/ui';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import type { Group } from '@/features/club/groups-content';
import { groupsModalLabels } from '@/features/club/groups-content';

interface GruppenModalPanelProps {
  group: Group;
  tint?: string;
  titleId: string;
  onClose: () => void;
}

export const GruppenModalPanel: FC<GruppenModalPanelProps> = ({
  group,
  tint,
  titleId,
  onClose,
}) => (
  <Card
    data-kk-gruppen-modal
    sx={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto',
      borderRadius: {
        xs: `${kkTokens.radius.base}px ${kkTokens.radius.base}px 0 0`,
        sm: `${kkTokens.radius.base}px`,
      },
      boxShadow: kkTokens.shadow.raised,
    }}
  >
    <Box sx={{ position: 'relative' }}>
      <KkPhotoPlaceholder
        label="gruppen-foto"
        tint={tint}
        aspectRatio={kkTokens.aspectRatio.banner}
      />
      <IconButton
        aria-label={groupsModalLabels.close}
        onClick={onClose}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          fontFamily: kkTokens.font.body,
          fontSize: '1rem',
          lineHeight: 1,
          '&:hover': { bgcolor: 'background.paper' },
        }}
      >
        ✕
      </IconButton>
    </Box>
    <Stack sx={{ gap: 2.5, p: { xs: 3, md: 4 } }}>
      <Typography id={titleId} variant="h3" component="h2">
        {group.title}
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        {group.fullText}
      </Typography>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ gap: { xs: 2, sm: 5 }, pt: 2.5, borderTop: 1, borderColor: 'divider' }}
      >
        <Stack sx={{ gap: 0.5 }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 800, letterSpacing: '0.08em', color: 'text.secondary' }}
          >
            {groupsModalLabels.lead}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {group.lead}
          </Typography>
        </Stack>
        <Stack sx={{ gap: 0.5 }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 800, letterSpacing: '0.08em', color: 'text.secondary' }}
          >
            {groupsModalLabels.schedule}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {group.schedule}
          </Typography>
        </Stack>
      </Stack>
      <Button
        component={RouterLink}
        to="/join"
        variant="contained"
        color="primary"
        size="large"
        onClick={onClose}
        sx={{ alignSelf: 'flex-start' }}
      >
        {groupsModalLabels.cta}
      </Button>
    </Stack>
  </Card>
);
