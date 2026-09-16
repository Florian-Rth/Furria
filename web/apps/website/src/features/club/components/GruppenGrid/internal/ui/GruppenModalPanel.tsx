import { KkPhotoPlaceholder, kkTokens } from '@furria/ui';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import { groupsLabels, groupsMailHref, resolveGroupOpenness } from '@/features/club/groups-content';
import type { PublicGroup } from '@/features/club/schemas';
import { GruppenOpennessChip } from './GruppenOpennessChip';

interface GruppenModalPanelProps {
  group: PublicGroup;
  tint?: string;
  titleId: string;
  onClose: () => void;
}

export const GruppenModalPanel: FC<GruppenModalPanelProps> = ({
  group,
  tint,
  titleId,
  onClose,
}) => {
  const openness = resolveGroupOpenness(group.isRecruiting);
  const description = group.description.trim();
  const hasDescription = description !== '';
  const body = hasDescription ? description : groupsLabels.noDescription;

  return (
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
          label={groupsLabels.photo}
          tint={tint}
          aspectRatio={kkTokens.aspectRatio.banner}
        />
        <IconButton
          aria-label={groupsLabels.close}
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
        <Stack sx={{ gap: 1.5, alignItems: 'flex-start' }}>
          <Typography id={titleId} variant="h3" component="h2">
            {group.name}
          </Typography>
          <GruppenOpennessChip openness={openness} />
        </Stack>
        <Typography
          variant="body1"
          sx={{ color: 'text.secondary', fontStyle: hasDescription ? 'normal' : 'italic' }}
        >
          {body}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {openness.note}
        </Typography>
        <Stack direction="row" sx={{ gap: 2, flexWrap: 'wrap', pt: 0.5 }}>
          <Button
            component={RouterLink}
            to="/join"
            variant="contained"
            color="primary"
            size="large"
            onClick={onClose}
          >
            {groupsLabels.joinCta}
          </Button>
          <Button variant="outlined" size="large" href={groupsMailHref}>
            {groupsLabels.askCta}
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
};
